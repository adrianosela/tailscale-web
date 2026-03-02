SHELL := /bin/bash

VITE    := node_modules/.bin/vite
TYPEDOC := node_modules/.bin/typedoc

.PHONY: help
help: ## Print this help menu
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: build
build: build-wasm build-js ## Build WASM + JS bundle

.PHONY: build-wasm
build-wasm: ## Compile Go to WASM (output: src/wasm/main.wasm)
	GOOS=js GOARCH=wasm go build -ldflags='-s -w' -o src/wasm/main.wasm

.PHONY: build-js
build-js: ## Bundle the standard JS library with Vite (output: dist/, WASM separate)
	$(VITE) build

.PHONY: demo 
demo: build-wasm ## Serve the dwmo with hot-reload (requires build-wasm first)
	(cd examples/demo && ../../node_modules/.bin/vite)

.PHONY: docs
docs: ## Generate TypeDoc API reference and embed demo (output: docs/)
	$(TYPEDOC)
	(cd examples/demo && ../../$(VITE) build --config vite.config.docs.ts)

.PHONY: preview-docs
preview-docs: ## Serve the generated docs locally on http://localhost:4173
	$(VITE) preview --outDir docs --port 4173

.PHONY: clean
clean: ## Remove build artifacts
	rm -f src/wasm/main.wasm
	rm -rf dist/
	rm -rf docs/
