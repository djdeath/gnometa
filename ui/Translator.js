const Lang = imports.lang;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GtkSource = imports.gi.GtkSource;

const AsyncContinuous = imports.AsyncContinuous;
const CompilerView = imports.CompilerView;
const FileSaver = imports.FileSaver;
const TextView = imports.TextView;
const TreeView = imports.TreeView;
const UiHelper = imports.UiHelperClient;
const Utils = imports.Utils;

const Translator = new Lang.Class({
  Name: 'Translator',
  Extends: Gtk.Box,
  Template: 'resource:///org/gnome/Gnometa/translator-template.ui',
  InternalChildren: [ 'error',
                      'depth-spinbutton',
                      'image',
                      'json-spinbutton',
                      'output-type',
                      'spinner',
                      'textview-viewport',
                      'treeview-viewport'],

  _init: function(args) {
    this.parent();
    this._compiler = args.compiler;
    [this._name, this._rule] = args.entry_point.split('.');
    this._input = args.input;
    //this._initial = args.initial;
    this._callbacks = {};

    this._output_type.connect('notify::active', this._renderingChanged.bind(this));
    this._depth_spinbutton.connect('notify::value', this._renderingChanged.bind(this));
    this._json_spinbutton.connect('notify::value', this._renderingChanged.bind(this));
    this._textview = new TextView.TextView();
    this._textview_viewport.add(this._textview);
    this._treeview = new TreeView.TreeView();
    this._treeview_viewport.add(this._treeview);
    let self = this;
    this._treeview.setDataController({
      getModel: function() {
        return [{ type: GObject.TYPE_STRING, renderer: 'text' }];
      },
      render: function(parent, data) {
        if (this._depth === undefined)
          this._depth = 0;
        else
          this._depth++;

        if (typeof data != 'object' || data === null || data === undefined) {
          let iter = this.insertBefore(parent, null);
          this.set(iter, data, ['' + data]);
          return;
        }
        for (let i in data) {
          if (typeof data[i] == 'function') continue;
          let iter = this.insertBefore(parent, null);
          if (typeof data[i] != 'object') {
            let s = data.constructor == Array ? '' + data[i] : i + ' : ' + data[i];
            this.set(iter, data, [s]);
          } else if (self._depth_spinbutton.value < 0 || this._depth < self._depth_spinbutton.value)
            this.render(iter, data[i]);
        }
        this._depth--;
      },
    });
    this._treeview.on('activated-data', function(data) { this._translateData(data); }.bind(this));
    this._compilerView = new CompilerView.CompilerView({ compiler: this._compiler });

    this._lang_manager = GtkSource.LanguageManager.get_default();
    this.setBusy(false);
    this.setError(null);

    if (this._input)
      this.setData(Utils.loadFile(this._input));

    if (this._name != '')
      this._createBuilder();

    if (this._compiler) {
      this._compilerView.setData(this._compiler, Utils.loadFile(this._compiler), 0, 0, 0, 0);
      this._compilerView.connect('changed', function(wid, text) {
        this._rebuildCompiler.run(text, true);
      }.bind(this));
      this._rebuildCompiler.run(this._compilerView.getData(), false);
    }
    if (this._input) {
      this._textview.buffer.connect('changed', function() {
        this._data = this._textview.getData();
        this._translateData(this._data);
      }.bind(this));
    }
  },

  _createBuilder: function() {
    this._translate = AsyncContinuous.createContinuous(function(ac, data) {
      if (data === undefined) {
        ac.done();
        return;
      }
      UiHelper.commands.translate(this._name, data, this._rule, this._name, function(error, ret) {
        this.setError(error);
        if (!error && this._input) FileSaver.delayedSaveFile(this._input, data);
        this._emit('changed', ret);
        ac.done();
      }.bind(this));
    }.bind(this));

    this._rebuildCompiler = AsyncContinuous.createContinuous(function(ac, text, save) {
      this.setBusy(true);
      let finish = function(error) {
        this.setBusy(false);
        this._compilerView.setError(error);
        if (!error && this._compiler && save) FileSaver.delayedSaveFile(this._compiler, text);
        ac.done();
      }.bind(this);
      UiHelper.commands.compile(this._name, text, function(error, ret) {
        if (error) return finish(error);

        this._map = ret;
        if (this._compiler)
          this._map.filenames[this._map.filenames.length - 1] = this._filename;
        else {
          // Using OMeta.
          this._translateData(this._data);
          return finish(null);
        }

        UiHelper.commands.compilerConfigure(this._name, this._name, this._rule, function(error, ret) {
          if (error) return finish(error);
          this._translateData(this._data);
          return finish(null);
        }.bind(this));
      }.bind(this));
    }.bind(this));
  },

  _translateData: function(data) {
    if (this._translate)
      this._translate.run(data);
  },

  _renderingChanged: function() {
    let isString = typeof this._data === 'string';

    this._output_type.sensitive = !isString;
    this._treeview.get_parent().visible = !isString && this._output_type.active == 0;
    this._textview.get_parent().visible = isString || this._output_type.active == 1;
    this._textview.editable = !!this._input;

    this._treeview.setData(this._data);
    this._treeview.expand_all();

    if (typeof this._data !== 'string')
      this._textview.buffer.set_text(JSON.stringify(this._data === undefined ? null : this._data,
                                                    null, this._json_spinbutton.value), -1);
  },

  getName: function() { return this._name; },

  setBusy: function(value) {
    this._spinner.active =  this._spinner.visible = value;
  },

  setError: function(error) {
    this._image.icon_name = error ? 'dialog-error' : 'emblem-default';
    this._error.label = error ? error.message + '\n' + error.stack : null;
    this._textview.hightlightRange('error',
                                   error && error.idx ? error.idx : 0,
                                   error && error.idx ? this._textview.getData().length - 1 : 0);
  },

  getData: function() {
    if (this._input)
      return this._textview.getData();
    return this._data;
  },

  setData: function(data) {
    this._data = data;
    let lang_manager = GtkSource.LanguageManager.get_default();
    if (typeof this._data === 'string') {
      this._textview.buffer.set_text(data, -1);
      this._textview.buffer.set_language(lang_manager.get_language('js'));
    } else {
      this._treeview.setData(data);
      this._treeview.expand_all();
      this._textview.buffer.set_language(lang_manager.get_language('json'));
    }
    this._renderingChanged();
    this._translateData(this._data);
  },

  //
  getCompilerView: function() {
    return this._compilerView;
  },

  //
  on: function(signal, callback) {
    this._callbacks[signal] = callback;
  },

  _emit: function(signal) {
    if (!this._callbacks[signal])
      return;
    var args = Utils.copyArrayRange(arguments, 1, arguments.length);
    this._callbacks[signal].apply(this, args);
  },
});
