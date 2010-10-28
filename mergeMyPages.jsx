#target indesign
const ZERO = 0;
const ONE = 1;
const PAGE_TITLE = "page"
const LOOP_COUNT = 100;
const INDD_EXT = ".indd";

//reference to the Document currently active in indesign - should be master doc
allDocs = app.documents;

var numDocs = allDocs.length;

// Add new document
var tmpDoc = app.documents.add();
	
// Set document preferences
with(tmpDoc.documentPreferences){
	pageHeight = "96p0";
	pageWidth = "68p3";
	pagesPerDocument = 1;
}
	
//Set page numbering
tmpDoc.sections[ZERO].continueNumbering = false;
tmpDoc.sections[ZERO].pageNumberStart = 1;


// Begin loop through master doc and split pages into new documents
for(var i=0; i<LOOP_COUNT/*numPages*/; i++) {
	
	var currDocName = PAGE_TITLE + i + INDD_EXT;

	currDoc = allDocs.item(currDocName);

	if(currDoc != null) {
	
		var currPath = currDoc.filePath + "/";
		var currFile = File(currPath + currDoc.name);

		//import styles to new doc
		//char-styles
		tmpDoc.importStyles(1131565940, currFile, GlobalClashResolutionStrategy.loadAllWithOverwrite);
		//para-styles
		tmpDoc.importStyles(1885885300, currFile, GlobalClashResolutionStrategy.loadAllWithOverwrite);
		//object-styles
		tmpDoc.importStyles(1332368244, currFile, GlobalClashResolutionStrategy.loadAllWithOverwrite);

		// Move page to beginning of new document and remove extra page
		currDoc.pages[ZERO].duplicate(LocationOptions.atEnd, tmpDoc.pages.lastItem());
		
		currDoc.close(SaveOptions.no);
	}
}

//get rid of blank page
tmpDoc.pages[ZERO].remove();

var fileName = prompt("Please enter file name:", "");
if (fileName=="") fileName = getDateName();

var filePath = Folder.selectDialog ("Please choose a Folder");
if(filePath == null) filePath = "c:";
var masterFile = File(filePath + "/" + fileName + INDD_EXT);

// Save and close new document
newDoc = tmpDoc.save(masterFile);
//newDoc.close(SaveOptions.yes);

alert("done doc merge");

function getDateName() {

	var currentTime = new Date();
	var month = currentTime.getMonth() + 1;
	var day = currentTime.getDate();
	var year = currentTime.getFullYear();
	var hour = currentTime.getHours();
	var minutes = currentTime.getMinutes();
	if (minutes < 10) { minutes = "0" + minutes; }
	
	var dateName = year + "-" + month + "-" + day + "_" + hour + minutes;
	return dateName;
}