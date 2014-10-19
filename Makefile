environment:
	@ln -f common/omnibox.js ios/omnibox.js
	@ln -f common/omnibox.js mac/omnibox.js

packages: environment
	@zip ios.zip ios/*
	@zip mac.zip mac/*

clean-environment:
	@rm -f ios/omnibox.js
	@rm -f mac/omnibox.js

clean-packages:
	@rm -f ios.zip
	@rm -f mac.zip
