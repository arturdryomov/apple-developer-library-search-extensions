environment:
	@ln -f common/omnibox.js ios/omnibox.js
	@ln -f common/omnibox.js mac/omnibox.js

packages:
	@zip --recurse-paths ios.zip ios --exclude "*.DS_Store"
	@zip --recurse-paths mac.zip mac --exclude "*.DS_Store"

clean-environment:
	@rm ios/omnibox.js
	@rm mac/omnibox.js

clean-packages:
	@rm ios.zip
	@rm mac.zip
