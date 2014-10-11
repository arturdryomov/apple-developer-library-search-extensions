environment:
	@ln -f common/omnibox.js ios/omnibox.js
	@ln -f common/omnibox.js mac/omnibox.js

clean-environment:
	@rm ios/omnibox.js
	@rm mac/omnibox.js
