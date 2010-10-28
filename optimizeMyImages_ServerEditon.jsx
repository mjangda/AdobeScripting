/*
* Resizer script
* 
* Copyright (c) Mohammad Jangda (batmoo@gmail.com)
*
*/

#target photoshop

const MAX_WIDTH = 800;
const MAX_HEIGHT = 600;
var FILE_TYPES = [".jpg",".jpeg",".png",".tiff",".tif",".gif"];

openFilePath = prompt("Please enter the location folder to pull images from:", "");
saveFilePath = prompt("Please enter the location folder to save images to:", "");

openFolder = new Folder(openFilePath);
saveFolder = new Folder(saveFilePath);
if(!saveFolder.exists) {
	saveFolder.create();
}

if(openFolder!=null && saveFolder!=null) {
	iterate(openFolder, saveFolder);
}

function iterate(openPath, savePath) {

	var files = openPath.getFiles();
	var f;
	
	for (var i=0; i<files.length; i++) {
		f = files[i];
		if(f instanceof Folder) {			
			iterate(f, savePath);
		} else if (f instanceof File) {
			//if proper file type, then open resize and save in new location
			if(isAllowedFileType(f)) {					
				app.open(f);
				resizeMyImages(savePath);
			}
		} else {
			alert("Unknown Data Type found. Exiting.")
			exit();
		}
	}
}


function isAllowedFileType(file) {
	for (var i=0; i<FILE_TYPES.length; i++) {
	
		var filename = file.name.toLowerCase();
		var ext = filename.substr(filename.lastIndexOf('.'));
		
		if(ext == FILE_TYPES[i]) {
			return true;
		}
	}
	return false;
}

function resizeMyImages(savePath) { 
	var docs = app.documents;
	var count = docs.length;
	var maxWidth = new UnitValue (MAX_WIDTH, "px");
	var maxHeight = new UnitValue (MAX_HEIGHT, "px");
  
	for (var i = 0; i < count; i++) {
  		doc = docs[i];
    	fname = doc.name;
		fname = File(savePath + "/" + fname);
		app.activeDocument = doc;
    
    	if (doc.width.as("px") < maxWidth.as("px") && doc.height.as("px") < maxHeight.as("px")) {
    	//No resize needed
   		} else {
	    	if (doc.width.as("px") > doc.height.as("px")) {
 	    		doc.resizeImage(maxWidth);
	    	} else {
      			ratio = doc.width.as("px") / doc.height.as("px");
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
		app.activeDocument.saveAs(savePath, jpgSaveOptions, false, Extension.LOWERCASE);
  	}

  	//Close all open images
  	while (app.documents.length) {
		app.activeDocument.close();
	}
}