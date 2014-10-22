OMETA_SOURCES = \
	bs-js-compiler.ometa \
	bs-ometa-compiler.ometa \
	bs-ometa-js-compiler.ometa \
	bs-ometa-optimizer.ometa

OMETA_STEP_GEN = $(OMETA_SOURCES:.ometa=.js.new)
OMETA_GEN = $(OMETA_SOURCES:.ometa=.js)

O1 =
O = @

OO = $(O$(V))

OMETA = $(OO) echo " GEN " $@;

%.js.new: %.ometa
	$(OMETA) ./gnometa $< > $@

%.js: %.js.new
	$(OO) mv $< $@

gen: $(OMETA_STEP_GEN)

install: $(OMETA_GEN)

clean:
	$(OO) rm -f $(OMETA_STEP_GEN)

reset:
	git checkout -f $(OMETA_GEN)
