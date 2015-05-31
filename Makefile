OMETA_RUNTIME = \
	ometa-runtime.js

OMETA_SOURCES = \
	ometa-base.ometa \
	\
	bs-js-compiler.ometa \
	bs-ometa-compiler.ometa \
	bs-ometa-js-compiler.ometa \
	bs-ometa-optimizer.ometa

OMETA_STEP_GEN = $(OMETA_SOURCES:.ometa=.js.new)
OMETA_GEN = $(OMETA_SOURCES:.ometa=.js)

O1 =
O = @

OO = $(O$(V))

OMETA = $(OO) echo " GEN " $@; ./gnometa
GCR = $(OO) echo " GLIB_COMPILE_RESOURCES " $@; glib-compile-resources

%.js.new: %.ometa
	$(OMETA) $< > $@

%.js: %.js.new
	$(OO) mv $< $@

gen: $(OMETA_STEP_GEN)

commit: $(OMETA_GEN)

ui/standalone.js: $(OMETA_SOURCES) $(OMETA_RUNTIME)
	$(OO) $(OMETA) -b $(OMETA_SOURCES) -s $@.map -o $@

standalone: ui/standalone.js

ui/org.gnome.Gnometa.gresource: ui/org.gnome.Gnometa.gresource.xml ui/*.ui ui/*.css
	$(OO) $(GCR) --sourcedir=ui ui/org.gnome.Gnometa.gresource.xml

ui: standalone ui/org.gnome.Gnometa.gresource

wc:
	$(OO) wc -l $(OMETA_SOURCES) $(OMETA_RUNTIME)

wc-ui:
	$(OO) wc -l ui/[A-Z]*.js

install:
	$(OO) test -n "$(PREFIX)" || (echo "No prefix given, please define PREFIX" && false)
	$(OO) echo "Installing to $(PREFIX)"
	$(OO) install -t $(PREFIX)/bin gnometa
	$(OO) install -t $(PREFIX)/share/gnometa gnometa

clean:
	$(OO) rm -f $(OMETA_STEP_GEN)
	$(OO) rm -f *~ ui/*~

reset:
	git checkout -f $(OMETA_GEN)
