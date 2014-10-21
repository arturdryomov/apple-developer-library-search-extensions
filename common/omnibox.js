var SUGGESTIONS_COUNT = 20;


var SUGGESTION = {
  passive: "Loading" + " " + LIBRARY_NAME + " " + "information...",
  active: "Search" + " " + LIBRARY_NAME + " " + "for" + " " + highlightText("%s")
};


var LIBRARY = {
  navigation: "navigation/",
  search: "search/",

  library: "library.json"
};


var library = null;


function highlightText(text) {
  return "<match>" + text + "</match>";
}


(function init() {
  downloadLibrary();
})();


function downloadLibrary() {
  if (library) {
    return;
  }

  var libraryRequest = new XMLHttpRequest();

  libraryRequest.onreadystatechange = function() {
    if ((this.readyState == this.DONE) && (this.status == 200)) {
      library = JSON.parse(this.responseText);

      openLibrary();
    }
  };

  libraryRequest.open("GET", LIBRARY_LOCATION + LIBRARY.navigation + LIBRARY.library);
  libraryRequest.send();
}


chrome.omnibox.setDefaultSuggestion({
  description: SUGGESTION.passive
});


chrome.omnibox.onInputStarted.addListener(function() {
  downloadLibrary();
});


function openLibrary() {
  chrome.omnibox.setDefaultSuggestion({
    description: SUGGESTION.active
  });

  chrome.omnibox.onInputChanged.addListener(function(searchQuery, sendSuggestions) {
    if (!library) {
      return;
    }

    searchQuery = searchQuery.trim();

    if (!searchQuery) {
      return;
    }

    var suggestions = [];

    for (var documentPosition = 0; documentPosition < library.documents.length; documentPosition++) {
      if (suggestions.length >= SUGGESTIONS_COUNT) {
        break;
      }

      var document = library.documents[documentPosition];

      var documentName = document[library.columns.name];
      var documentPath = document[library.columns.url];
      var documentType = document[library.columns.type];

      var searchQueryStartPosition = documentName.toLowerCase().indexOf(searchQuery.toLowerCase(), 0);
      var searchQueryFinishPosition = searchQueryStartPosition + searchQuery.length;

      if (searchQueryStartPosition == -1) {
        continue;
      }

      var suggestion = "";

      suggestion += documentName.substring(0, searchQueryStartPosition);
      suggestion += highlightText(documentName.substring(searchQueryStartPosition, searchQueryFinishPosition));
      suggestion += documentName.substring(searchQueryFinishPosition, documentName.length);

      suggestions.push({
        content: LIBRARY_LOCATION + LIBRARY.navigation + documentPath,
        description: suggestion,
        type: documentType
      });
    }

    suggestions.sort(function(leftSuggestion, rightSuggestion) {
      var leftSuggestionOrder = findSuggestionOrder(leftSuggestion.type);
      var rightSuggestionOrder = findSuggestionOrder(rightSuggestion.type);

      return leftSuggestionOrder - rightSuggestionOrder;
    });

    suggestions.forEach(function(suggestion) {
      delete suggestion.type;
    });

    sendSuggestions(suggestions);
  });

  chrome.omnibox.onInputEntered.addListener(function(searchQuery) {
    if (searchQuery.indexOf("https://") == -1) {
      searchQuery = LIBRARY_LOCATION + LIBRARY.search + "?q=" + searchQuery;
    }

    chrome.tabs.getSelected(null, function(tab) {
      chrome.tabs.update(tab.id, {url: searchQuery});
    });
  });
}


function findSuggestionOrder(suggestionType) {
  var topics = library.topics[0].contents;

  return topics.filter(function(topic) {
    return topic.key == suggestionType;
  })[0].sortOrder;
}
