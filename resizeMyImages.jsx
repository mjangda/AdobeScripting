/*
* Resizer script
* 
* Copyright (c) Mohammad Jangda (m3jangda@uwaterloo.ca)
*
*/

#target photoshop

const MAX_WIDTH = 640;
const MAX_HEIGHT = 480;

resizeMyImages();

function resizeMyImages() { 
	var docs = app.documents;
	var count = docs.length;
	var maxWidth = new UnitValue (640, "px");
	var maxHeight = new UnitValue (480, "px");
  
	for (var i = 0; i < count; i++) {
  		doc = docs[i];
    	fname = doc.name;
		fname = File(doc.path + "/" + fname);
		app.activeDocument = doc;
    
    	if (doc.width.as("px") < maxWidth.as("px") && doc.height.as("px") < maxHeight.as("px")) {
//	    	alert("no resize needed");
   		} else {
	    	if (doc.width.as("px") > doc.height.as("px")) {
 	    		doc.resizeImage(maxWidth);
	    	} else {
      			ratio = doc.width.as("px") / doc.height.as("px");
//	     		alert(ratio);
	  	    	width = maxHeight * ratio;
      			doc.resizeImage(width,maxHeight);
		    }
		}
	
		//ensure RGB mode
		if(doc.mode!="RGB") {
			doc.changeMode(ChangeMode.RGB);
		}

		// Save as JPEG
		jpgSaveOptions = new JPEGSaveOptions();
		jpgSaveOptions.embedColorProfile = true;
		jpgSaveOptions.matte = MatteType.NONE;
		jpgSaveOptions.quality = 8;
		app.activeDocument.saveAs(fname, jpgSaveOptions, false, Extension.LOWERCASE);
  	}

  	//Close all open images
  	while (app.documents.length) {
		app.activeDocument.close();
	}
}