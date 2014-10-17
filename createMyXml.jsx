/** createMyXML.jsx v0.1
*
* This script is intended for use with Adobe InDesign CS2.
* 
* This script generates an xml file (.xml) from an indesign document (.indd)
* User assigns each story in the page a unique scripting label and the script tags the 
* content accordingly based on the styles used for content. 
* Multiple pages are supported!
* 
* @Copyright: (c) Mohammad Jangda (batmoo@gmail.com)
* @License: MIT License (http://www.opensource.org/licenses/mit-license.php)
*
*/

/* tells script engine that this script is to be run in indesign (and not another adobe app) */
#target indesign

/** ----EDIT---- **/
defaultMapLocation = "/c/Program Files/Adobe/InDesign CS2/Presets/Scripts/";
/** ----STOP---- **/

//array of styles in document (ensure that all of these styles exist in the document or the script engine will throw an error)
myStyles = new Array();
//array of xml tags (ensure that the position of the tags in this array match up with their desired styles in the myStyles array)
myTags = new Array();

/* global variables */
//reference to the Document currently active in indesign
myDoc = app.activeDocument;
//reference to an array of all the PageItems in the Document
myPageItems = myDoc.allPageItems;
//reference to the Root of the Document's XML structure - Root is, by default, the topmost element in the structure
xmlRoot = myDoc.xmlElements.item("Root");
//an array of all the labels found in the Document
labels = getLabels();

/* call main function that does everything */
createXML();

/**
* main function of the script;
* calls a bunch of other functions which working together create the xml document;
**/
function createXML() {

	if(labels!=null) {	
	//labels were found in the Document, so proceed with the XML creation

//		styleOversetText();
		readMapFile();
		for(var i=0; i<labels.length; i++) {
			var xmlElem = xmlRoot.xmlElements.add({markupTag:"Article"});
			xmlElem.xmlAttributes.add("Label", labels[i]);
			markupItems(returnItemsWithLabel(i), xmlElem);
		} //end for
		mapStylesToTags();
		var exported = exportXMLFile();
//		cleanUpXMLFile(exported);
		alert("createMyXML complete");
	} //end if
	else {
	//no labels were found in the Document; alert user; script ends
		alert("No PageItems are labelled. Please label and run this script again.");
	} //end else
	
} //createXML

/**
* Reads through map file and loads Paragraph Style/XML Tag maps into arrays
**/
function readMapFile() {
	var f = new File(defaultMapLocation +"createMyXML.map");

	if(!f.exists) {
		alert("Map file not found. Please locate and select the map file.");
		f = File.OpenDialog();
	}
	var i = 0;
	
	if(f.open("r:")) {
		if(f.length > 0) {
			while(f.tell() < f.length) {
				var ln = f.readln();
				if(ln.charAt(0)!="#") {
					var spl = ln.split("||");
					if(spl.length==2) {
						myStyles[i] = spl[0];
						myTags[i] = spl[1];
						i++;
					}
				}
			}
		}
		f.close();
	}
} //readMapFile


/**
* CURRENTLY UNUSED
**/
function cleanUpXMLFile(xmlFile) {
	var f = new File(xmlFile);
	if(f.open("e:")) {
		if(f.length > 0) {
			while(f.tell() < f.length) {
				var content = f.read();
				alert(content);
				var replaced = makeWebReady(content);
				alert(replaced);
				f.seek(0,0);
				var write = f.write(replaced);
			}
		}
		f.close();
	}
} //cleanUpXMLFile

/**
* CURRENTLY UNUSED
**/
function makeWebReady(txt) {
	//Newline char: â€©
//	txt = txt.replace(/â€©/g,"");
	txt = txt.replace(/\r/g,"");

	//Apostrophe â€™
//	txt = txt.replace(/â€™/g,"&apos;");
	txt = txt.replace(/’/g,"&apos;");

	//Open quote: â€œ
//	txt = txt.replace(/â€œ/g,"&quot;");
	txt = txt.replace(/“/g,"&quot;");
	
	//End quote: â€
//	txt = txt.replace(/â€/g,"&quot;");
	txt = txt.replace(/”/g,"&quot;");
	
	//Em Dash: â€”
//	txt = txt.replace(/â€”/g,"&mdash;");
	txt = txt.replace(/—/g,"&mdash;");
	//Others go below - single quote, copyright symbol, trademark symbol (??)

	return txt;
} //makeWebReady

/**
* Creates an XML file named document.xml where "document" is the name of the active Document;
* XML file is saved in the same location as the indesign Document;
* Images in Document are optimized and saved as high quality JPEGs in a folder called "Images" in the same location as the XML file;
**/
function exportXMLFile() {

	/**
	* Due to a bug in the scripting engine, app.xmlExportPreferences do not work
	* As a workaround, manually export a page to xml and set the desired settings
	* The settings will be carried over when you run the script
	*/
	
	var path = myDoc.filePath + "/";
	var xmlName = myDoc.name.substring(0, myDoc.name.indexOf("."));
	var xmlFile = File(path + xmlName + ".xml");
	myDoc.exportFile(ExportFormat.xml, xmlFile, false);

	return xmlFile;

} //exportXMLFile

/**
*
**/
function mapStylesToTags() {
	for(var j=0;j<myStyles.length;j++) { 
		myDoc.xmlExportMaps.add(myStyles[j], myTags[j]); 
	} 
	myDoc.autoTag();
} //mapStylesToTags


/**
*
**/
function markupItems(items,xmlElem) {
	for(var i=0; i<items.length; i++) {	
		if(!isTaggedSingle(items[i])) {
				items[i].markup( xmlElem.xmlElements.add({markupTag:"Item"}) );
		}
	}
} //markupItems


/**
* Returns array of PageItems that have been labelled
**/
function returnItemsWithLabel(index) {
	var objLabel;
	var theLabel = labels[index];
	var toSelect = new Array();
	
	for(var i=0; i < myPageItems.length; i++) {
		objLabel = myPageItems[i].label;
		if(objLabel==theLabel) {
			//check to make sure current pageItem is an instance of a TextFram
			//if it is, push into array
			if(myPageItems[i].getElements()[0] instanceof TextFrame) {
				toSelect.push(myPageItems[i]);
			}
		}
	}
	return toSelect;
}

/**
* Returns an array of labels found in the document
**/
function getLabels() {
	var myArray = new Array()
	var numArrayItems = 0;
	var objLabel;

	for(var i = myPageItems.length - 1 ; i >= 0 ; i--) {
		styleOffPagePI(myPageItems[i]);
		objLabel = myPageItems[i].label;
		if((objLabel!="") && (contains(myArray, objLabel)==false)) {	
			myArray[numArrayItems] = objLabel;
			numArrayItems++;
		}
	}
	if(myArray.length==0) {
		return null;
	}
	return myArray;
}


/**
* CURRENTLY UNUSED
**/
function ensureParagraphStyles() {
	if(myDoc.paragraphStyles.item("Copy: overflow")==null) {
		myDoc.paragraphStyles.add({name:"Copy: overflow"});
	}
	if(myDoc.paragraphStyles.item("Copy: offpage")==null) {
		myDoc.paragraphStyles.add({name:"Copy: offpage"});
	}
} //ensureParagraphStyles

/**
* CURRENTLY UNUSED
**/
function styleOversetText() {

	var stories = myDoc.stories;
	for(var i=0;i<stories.length;i++) {
		if(stories[i].overflows) {
			paras = stories[i].paragraphs;
			for(var j=0; j<paras.length; j++) {
				if(paras[j].parentTextFrames=="")  {
					paras[j].applyStyle(myDoc.paragraphStyles.item("Copy: overflow"));
				} //end if
			}//end for
		} //end if
	} //end for

} //styleOversetText

/**
* CURRENTLY UNUSED
* Any PageItems that are off the spread are styled 
**/
function styleOffPagePI(pageItem) {
	if(pageItem instanceof TextFrame) {
		if(pageItem.parent instanceof Spread) {
			for(var p=0; p < pageItem.paragraphs.length; p++) {
				pageItem.paragraphs[p].applyStyle(myDoc.paragraphStyles.item("Copy: offpage"));
			}
		}
	}
}

/** ---- UTILITY FUNCTIONS ---- **/

/**
*
**/
function contains(theArray, str) {
	for(var i=0; i<theArray.length; i++) {
		if (theArray[i]==str) { return true; }
	}
	return false;
}

/**
*
**/
function isArticleTag(tag) {
	for(var i=0; i<myTags.length; i++) {
		if(tag==myTags[i]) {
			return true;
		}
	}
	return false;
} //isArticleTag

/**
* Returns true if item is already tagged
**/
function isTaggedSingle(item) {
	if(item.associatedXMLElement!=null) {
		return true;
	}	
	return false;
}


/**
* 
**/
function isTaggedGroup(items) {
	for(var i=0;i<items.length;i++) {
		if(items[i].associatedXMLElement!=null) {
			return true;
		}
	}
	return false;
}

/**
* 
**/
function isInGroup(myItem){
	var myGroup = myItem.parent;
	while (myGroup.constructor.name != "Group") {
	     if (myGroup.constructor.name == "Application") { return null; }
    	 myGroup = myGroup.parent;
	}
	return myGroup;
}


/**
* Ungroups grouped elements on the page to allow for xml conversion
**/
function ungroupAll() {
	for(var i=0;i<myDoc.groups.length;i++) {
		myDoc.groups[i].ungroup();
	}
}
