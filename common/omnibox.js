var SUGGESTION = {
  default: "Loading" + " " + LIBRARY_NAME + " " + "information...",
  active: "Search" + " " + LIBRARY_NAME + " " + "for" + " " + highlightText("%s")
};

var SUGGESTIONS_COUNT = 20;


var LIBRARY = {
  navigation: "navigation/",
  search: "search/",

  catalogue: "library.json"
};


var library = {
  catalogue: null,

  documentNamePosition: 0,
  documentPathPosition: 0
};


function highlightText(text) {
  return "<match>" + text + "</match>";
}


(function init() {
  downloadLibrary();
})();


function downloadLibrary() {
  if (library.catalogue) {
    return;
  }

  var libraryRequest = new XMLHttpRequest();

  libraryRequest.onreadystatechange = function() {
    if ((this.readyState == this.DONE) && (this.status == 200)) {
      library.catalogue = JSON.parse(this.responseText);

      library.documentNamePosition = library.catalogue.columns.name;
      library.documentPathPosition = library.catalogue.columns.url;

      openLibrary();
    }
  };

  libraryRequest.open("GET", LIBRARY_LOCATION + LIBRARY.navigation + LIBRARY.catalogue);
  libraryRequest.send();
}


chrome.omnibox.setDefaultSuggestion({
  description: SUGGESTION.default
});


chrome.omnibox.onInputStarted.addListener(function() {
  downloadLibrary();
});


function openLibrary() {
  chrome.omnibox.onInputChanged.addListener(function(searchQuery, sendSuggestions) {
    chrome.omnibox.setDefaultSuggestion({
      description: SUGGESTION.active
    });

    if (!library.catalogue) {
      return;
    }

    if (!searchQuery) {
      return;
    }

    var suggestions = [];

    for (var documentPosition = 0; documentPosition < library.catalogue.documents.length; documentPosition++) {
      if (suggestions.length >= SUGGESTIONS_COUNT) {
        break;
      }

      var document = library.catalogue.documents[documentPosition];

      var documentName = document[library.documentNamePosition];
      var documentPath = document[library.documentPathPosition];

      var searchQueryStartPosition = documentName.toLowerCase().indexOf(searchQuery.toLowerCase(), 0);
      var searchQueryFinishPosition = searchQueryStartPosition + searchQuery.length;

      if (searchQueryStartPosition != -1) {
        var suggestion = "";

        suggestion += documentName.substring(0, searchQueryStartPosition);
        suggestion += highlightText(documentName.substring(searchQueryStartPosition, searchQueryFinishPosition));
        suggestion += documentName.substring(searchQueryFinishPosition, documentName.length);

        suggestions.push({
          content: LIBRARY_LOCATION + LIBRARY.navigation + documentPath,
          description: suggestion
        });
      }
    }

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
