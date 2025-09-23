import * as vscode from 'vscode';
import { posix } from 'path';

let singleSizeData = `,
	{
		"filament_weight": 1000,
		"diameter": 1.75,
		"ean": "EANNUMBER",
		"article_number": "INTERNAL_SHOPID",
		"purchase_links": [
			{
				"store_id": "STOREID",
				"url": "STOREURL",
				"affiliate": false
			}
		]
	}`;

let singlePurchaseLink = `,
			{
				"store_id": "STOREID",
				"url": "STOREURL",
				"affiliate": false
			}`;

async function addSize(editor: vscode.TextEditor, edit: any) {
	editor.selections.forEach((selection, i) => {
        edit.replace(selection, singleSizeData)
	});
}

async function addPurchase(editor: vscode.TextEditor, edit: any) {
	editor.selections.forEach((selection, i) => {
        edit.replace(selection, singlePurchaseLink)
	});
}

function replaceAtStr(target: string, index: number, replacement: string) {
    return target.substring(0, index) + replacement + target.substring(index + replacement.length);
}

function preprocessName(name: string) {
	const strArr = name.split(/(\s+)/);
	let tmpArr: string[] = []

	strArr.forEach((str, index) => {
		if (str != "") {
			let tmpStr = str.toLowerCase();
			tmpStr = replaceAtStr(tmpStr, 0, tmpStr[0].toUpperCase());
			tmpArr[index] = tmpStr;
		} else {
			tmpArr[index] = str;
		}
	});

	return tmpArr.join("");
}

async function newVariant(location: any) {
	let variantName = await vscode.window.showInputBox({
		placeHolder: 'What is your variant called?',
		ignoreFocusOut: true
	});

	if (variantName === undefined) {
		vscode.window.showErrorMessage("No variant name");
		return;
	}
	
	variantName = preprocessName(variantName);

	let variantColour = await vscode.window.showInputBox({
		placeHolder: 'And what is its colour hex?',
		ignoreFocusOut: true
	});

	if (variantColour === undefined) {
		vscode.window.showErrorMessage("No variant colour");
		return;
	} else {
		if (variantColour.length != 7 && variantColour.length != 6) {
			vscode.window.showErrorMessage("Invalid variant colour, needs to be length of either 6 or 7 with a starting #");
			return;
		}

		if (variantColour.length == 7 && variantColour[0] != "#") {
			vscode.window.showErrorMessage("Invalid variant colour, if length of 7 needs to start with #");
			return;
		}
	}

	if (variantColour.length == 6) {
		variantColour = `#${variantColour}`
	}

	const newFolder = `${location}/${variantName}`
	const folderURI = vscode.Uri.parse(newFolder);
	const fs = vscode.workspace.fs;

	await fs.createDirectory(folderURI);
	
	const variantFile = folderURI.with({ path: posix.join(folderURI.path, "variant.json") });

	let variantData = {
		"color_name": variantName,
		"color_hex": variantColour
	}

	await fs.writeFile(variantFile, Buffer.from(JSON.stringify(variantData, null, 2), "utf8"));

	const sizesFile = folderURI.with({ path: posix.join(folderURI.path, "sizes.json") });

	let sizesData = [
		{
			"filament_weight": 1000,
			"diameter": 1.75,
			"ean": "EANNUMBER",
			"article_number": "INTERNAL_SHOPID",
			"purchase_links": [
				{
					"store_id": "STOREID",
					"url": "STOREURL",
					"affiliate": false
				}
			]
		}
	]

	await fs.writeFile(sizesFile, Buffer.from(JSON.stringify(sizesData, null, 2), "utf8"));
	vscode.window.showTextDocument(sizesFile);
}

async function newFilament(location: any) {
	let filamentName = await vscode.window.showInputBox({
		placeHolder: 'What is your filament called?',
		ignoreFocusOut: true
	});

	if (filamentName === undefined) {
		vscode.window.showErrorMessage("No filament name");
		return;
	}

	let density: string|number|undefined = await vscode.window.showInputBox({
		placeHolder: 'And what is its density?',
		ignoreFocusOut: true
	});

	if (density === undefined || !Number.parseFloat(density)) {
		vscode.window.showErrorMessage("Invalid density");
		return;
	}

	density = Number.parseFloat(density.replaceAll(",", "."));

	const newFolder = `${location}/${filamentName}`
	const folderURI = vscode.Uri.parse(newFolder);
	const fs = vscode.workspace.fs;

	await fs.createDirectory(folderURI);
	
	const filamentFile = folderURI.with({ path: posix.join(folderURI.path, "filament.json") });

	let filamentData = {
		"name": filamentName,
		"diameter_tolerance": 0.02,
		"density": density
	}

	await fs.writeFile(filamentFile, Buffer.from(JSON.stringify(filamentData, null, 2), "utf8"));
	vscode.window.showTextDocument(filamentFile);
}

async function newMaterial(location: any) {
	let materialName = await vscode.window.showInputBox({
		placeHolder: 'What is your material called?',
		ignoreFocusOut: true
	});

	if (materialName === undefined) {
		vscode.window.showErrorMessage("No material name");
		return;
	}

	const newFolder = `${location}/${materialName}`
	const folderURI = vscode.Uri.parse(newFolder);
	const fs = vscode.workspace.fs;

	await fs.createDirectory(folderURI);
	
	const materialFile = folderURI.with({ path: posix.join(folderURI.path, "material.json") });

	let materialData = {
		"material": materialName,
	}

	await fs.writeFile(materialFile, Buffer.from(JSON.stringify(materialData, null, 2), "utf8"));
	vscode.window.showTextDocument(materialFile);
}

async function newBrand(location: any) {
	let brandName = await vscode.window.showInputBox({
		placeHolder: 'What is your material called?',
		ignoreFocusOut: true
	});

	if (brandName === undefined) {
		vscode.window.showErrorMessage("No brand name");
		return;
	}

	let websiteURL = await vscode.window.showInputBox({
		placeHolder: 'and whats the website url?',
		ignoreFocusOut: true
	});

	if (websiteURL === undefined) {
		vscode.window.showErrorMessage("No brand website");
		return;
	}

	let origin = await vscode.window.showInputBox({
		placeHolder: 'and whats its origin country code? (OPTIONAL)'
	});

	if (origin === undefined) {
		origin = "unknown";
	}

	const newFolder = `${location}/${brandName}`
	const folderURI = vscode.Uri.parse(newFolder);
	const fs = vscode.workspace.fs;

	await fs.createDirectory(folderURI);
	
	const brandFile = folderURI.with({ path: posix.join(folderURI.path, "brand.json") });

	let brandData = {
		"brand": brandName,
		"website": websiteURL,
		"logo": "FILENAME.png, place it next to this file, it needs to be 400x400, svg, png or jpg",
		"origin": origin
	}

	await fs.writeFile(brandFile, Buffer.from(JSON.stringify(brandData, null, 2), "utf8"));
	vscode.window.showTextDocument(brandFile);
}

export function activate(context: vscode.ExtensionContext) {
	vscode.commands.registerCommand('extension.newVariant', async (params) => {
		try {
			await newVariant(params);
		} catch (e) {
			vscode.window.showErrorMessage(`Error ${e}`)
		}
	});

	vscode.commands.registerCommand('extension.newFilament', async (params) => {
		try {
			await newFilament(params);
		} catch (e) {
			vscode.window.showErrorMessage(`Error ${e}`)
		}
	});

	vscode.commands.registerCommand('extension.newMaterial', async (params) => {
		try {
			await newMaterial(params);
		} catch (e) {
			vscode.window.showErrorMessage(`Error ${e}`)
		}
	});

	vscode.commands.registerCommand('extension.newBrand', async (params) => {
		try {
			await newBrand(params);
		} catch (e) {
			vscode.window.showErrorMessage(`Error ${e}`)
		}
	});

	vscode.commands.registerTextEditorCommand('extension.addSize', async (editor, edit) => {
		try {
			await addSize(editor, edit);
		} catch (e) {
			vscode.window.showErrorMessage(`Error ${e}`)
		}
	});

	vscode.commands.registerTextEditorCommand('extension.addPurchase', async (editor, edit) => {
		try {
			await addPurchase(editor, edit);
		} catch (e) {
			vscode.window.showErrorMessage(`Error ${e}`)
		}
	});
}