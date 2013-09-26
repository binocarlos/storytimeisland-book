build: index.js template.js components
	@component build

components:
	@component install

template.js: template.html
	@component convert $<	

clean:
	rm -fr build components

.PHONY: clean