TEST_OPTS=--recursive \
					 --reporter list \
					 --slow 100 \
					 --require test/helper

test:
	@NODE_ENV=test ./node_modules/.bin/mocha $(TEST_OPTS)

test-watch:
	@NODE_ENV=test ./node_modules/.bin/mocha $(TEST_OPTS) \
		--watch

.PHONY: test test-watch
