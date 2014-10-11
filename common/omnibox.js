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


chrome.omnibox.setDefaultSuggestion({
  description: SUGGESTION.default
});

chrome.omnibox.onInputStarted.addListener(function() {
  if (library.catalogue) {
    return;
  }

  var libraryRequest = new XMLHttpRequest();

  libraryRequest.onreadystatechange = function() {
    if ((this.readyState == this.DONE) && (this.status == 200)) {
      library.catalogue = JSON.parse(this.responseText);

      library.documentNamePosition = library.catalogue.columns.name;
      library.documentPathPosition = library.catalogue.columns.url;
    }
  };

  libraryRequest.open("GET", LIBRARY_LOCATION + LIBRARY.navigation + LIBRARY.catalogue);
  libraryRequest.send();
});

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

  library.catalogue.documents.forEach(function(document) {
    if (document[library.documentNamePosition].toLowerCase().indexOf(searchQuery.toLowerCase(), 0) != -1) {
      suggestions.push({
        content: document[library.documentNamePosition],
        description: document[library.documentNamePosition]
      });
    }
  });

  sendSuggestions(suggestions);
});

chrome.omnibox.onInputEntered.addListener(function(searchQuery) {
  var searchUrl = LIBRARY_LOCATION+ LIBRARY.search + "?q=" + searchQuery;

  library.catalogue.documents.forEach(function(document) {
    if (document[library.documentNamePosition] == searchQuery) {
      searchUrl = LIBRARY_LOCATION + LIBRARY.navigation + document[library.documentPathPosition];
    }
  });

  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.update(tab.id, { url: searchUrl});
  });
});
