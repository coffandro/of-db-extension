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

function replaceAtStr(target: string, index: number, replacement: string) {
    return target.substring(0, index) + replacement + target.substring(index + replacement.length);
}

function preprocessVariantName(name: string) {
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
	
	variantName = preprocessVariantName(variantName);

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

export function activate(context: vscode.ExtensionContext) {
	vscode.commands.registerCommand('extension.newVariant', async (params) => {
		try {
			await newVariant(params);
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