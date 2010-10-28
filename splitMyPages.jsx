/*
* splitMyPages for Adobe InDesign CS2
*
* This script will take a document with multiple pages and split off each page into a seperate InDesign file.
* Files are named pageX.indd, where X is the page number, and saved in the folder as the original master file.
* 
* @Copyright: (c) Mohammad Jangda (batmoo@gmail.com)
* @License: MIT License (http://www.opensource.org/licenses/mit-license.php)
*
*/

#target indesign

// get the active document
var myTemplate = app.activeDocument;
var myTemplateFile = File(myTemplate.fullName);

// Ask user for save location
saveFilePath = prompt("Enter the full path where you want the pages to be saved (e.g. \\Imprint3\\Issues\\2009.02.30\\)", "");
if(saveFilePath) {

	// Create the Folder object
	saveFolder = new Folder(saveFilePath);
	// If folder doesn't exist, create it
	if(!saveFolder.exists) saveFolder.create();

	// with the active document, do stuff!
	with(myTemplate){

		// iterate through all pages
		for(var num=0; num<myTemplate.pages.length; num++) {
		
			// create new document in the background
			var myNewDoc = app.documents.add(true)
		
			// set preferences, particularly size
			with(myNewDoc.documentPreferences){
				pageHeight = "96p0";
				pageWidth = "68p3";
			}
		
			// set page numbering
			myNewDoc.sections[0].continueNumbering = false;
			myNewDoc.sections[0].pageNumberStart = (num+1);

			// copy elements over from template
			myTemplate.pages.item(num).duplicate (LocationOptions.before, myNewDoc.pages[0]);
			myNewDoc.pages[1].remove();

			// import styles
			myNewDoc.importStyles(ImportFormat.characterStylesFormat, myTemplateFile)
			myNewDoc.importStyles(ImportFormat.paragraphStylesFormat, myTemplateFile)
			myNewDoc.importStyles(ImportFormat.textStylesFormat, myTemplateFile)

			// close and save as pagexx.indd
			saveFile = File(saveFolder + "/" + 'page' + (num+1) + '.indd');
			myNewDoc = myNewDoc.close(SaveOptions.yes, saveFile);
		}
	}
} else {
	alert("Fine! Don't follow instructions! Screw you guys, I'm going home!");
}