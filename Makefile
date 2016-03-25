NULL =

OMETA_RUNTIME = \
	ometa-runtime.js \
	$(NULL)

OMETA_SOURCES = \
	ometa-base.ometa \
	\
	bs-js-compiler.ometa \
	bs-ometa-compiler.ometa \
	bs-ometa-js-compiler.ometa \
	bs-ometa-optimizer.ometa \
	$(NULL)

OMETA_STEP_GEN = $(OMETA_SOURCES:.ometa=.js.new)
OMETA_GEN = $(OMETA_SOURCES:.ometa=.js)

O1 =
O = @

OO = $(O$(V))

OMETA = $(OO) echo " GEN " $@; ./gnometa
GCR = $(OO) echo " GLIB_COMPILE_RESOURCES " $@; glib-compile-resources

OMETA_TEST_FILES = \
	tests/input.ometa \
	tests/jumptable-optimized.ometa \
	tests/location.ometa \
	tests/sequence-optimized.ometa \
	tests/test.ometa \
	$(NULL)
OMETA_TESTS_FILES_JS = $(patsubst %.ometa,%.js,$(OMETA_TEST_FILES))
OMETA_TESTS = $(patsubst tests/%.ometa,%,$(OMETA_TEST_FILES))

define test_rules
tests/$(1).js: tests/$(1).ometa
	$$(OO) $$(OMETA) -b tests/$(1).ometa > tests/$(1).js

$(1)-run: tests/$(1).js
	$$(OO) gjs tests/$(1).js
endef

$(foreach t,$(OMETA_TESTS),$(eval $(call test_rules,$(t))))

tests: $(OMETA_TESTS_FILES_JS)
#$(patsubst %,%-build,$(OMETA_TESTS))

run-tests: $(patsubst %,%-run,$(OMETA_TESTS))

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
	$(OO) rm -f $(OMETA_STEP_GEN) $(OMETA_TESTS_FILES_JS)
	$(OO) rm -f *~ ui/*~

reset:
	git checkout -f $(OMETA_GEN)
