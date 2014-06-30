MOCHA=./node_modules/mocha/bin/mocha
REPORTER=progress

# these tests involve a lot of downloading
# not intended for continuous execution
test:
	@$(MOCHA) \
		--reporter $(REPORTER) \
		test/*
	
.PHONY: test
