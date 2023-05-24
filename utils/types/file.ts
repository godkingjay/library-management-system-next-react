export const validArchiveTypes = {
	ext: [
		".7z",
		".cbr",
		".deb",
		".gz",
		".gzip",
		".pak",
		".pkg",
		".rar",
		".rpm",
		".tar.gz",
		".tgz",
		".xapk",
		"application/x-zip-compressed",
		".zipx",
	],
	type: "archive",
};

export const validConfigTypes = {
	ext: [
		"application/json",
		".xml",
		".yaml",
		".ini",
		".conf",
		".config",
		".properties",
	],
	type: "config",
};

export const validDataTypes = {
	ext: [
		".aae",
		".bin",
		".csv",
		".dat",
		".mpp",
		".obb",
		".rpt",
		".sdf",
		".vcf",
		"application/vnd.ms-excel",
	],
	type: "data",
};

export const validDatabaseTypes = {
	ext: [".accdb", ".crypt14", ".db", ".mdb", ".odb", ".pdb", ".sql", ".sqlite"],
	type: "database",
};

export const validDeveloperFilesTypes = {
	ext: [
		".c",
		".class",
		".cpp",
		".cs",
		".h",
		".java",
		".kt",
		".lua",
		".m",
		".pl",
		".php",
		".py",
		".swift",
		".unity",
		".vb",
		".vcxproj",
		".xcodeproj",
		".yml",
	],
	type: "developer-files",
};

export const validDiskImageTypes = {
	ext: [".dmg", ".img", ".iso", ".mdf", ".rom", ".vcd"],
	type: "disk-image",
};

export const validDocumentTypes = {
	ext: [
		".doc",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		".odt",
	],
	type: "document",
};

export const validFontTypes = {
	ext: [".fnt", ".otf", ".ttf", ".woff", ".woff2"],
	type: "font",
};

export const validHTMLTypes = {
	ext: [".htm", ".html", ".xhtml"],
	type: "html",
};

export const validImageTypes = {
	ext: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
	type: "image",
};

export const validMessageTypes = {
	ext: [".eml", ".msg", ".oft", ".ost", ".pst", ".vcf"],
	type: "message",
};

export const validMusicTypes = {
	ext: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/m4a"],
	type: "music",
};

export const validPageLayoutTypes = {
	ext: [".afpub", ".indd", ".oxps", ".pmd", ".pub", ".qxp", ".xps"],
	type: "page-layout",
};

export const validPdfType = {
	ext: ["application/pdf"],
	type: "pdf",
};

export const validPresentationTypes = {
	ext: [
		".ppt",
		"application/vnd.openxmlformats-officedocument.presentationml.presentation",
		".odp",
		".key",
	],
	type: "presentation",
};

export const validProgramTypes = {
	ext: [
		".exe",
		".msi",
		".jar",
		".apk",
		".app",
		".ipa",
		".bat",
		".run",
		".sh",
		"application/x-msdownload",
	],
	type: "program",
};

export const validSpreadsheetTypes = {
	ext: [
		".xls",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		".numbers",
		".ods",
		".xlr",
	],
	type: "spreadsheet",
};

export const validTextTypes = {
	ext: ["text/plain", ".md", ".log", ".rtf", ".tex", ".wpd"],
	type: "text",
};

export const validThreeDImageTypes = {
	ext: [".3dm", ".3ds", ".max", ".obj", ".blend", ".fbx", ".dae"],
	type: "3d-image",
};

export const validVectorImageTypes = {
	ext: [".cdr", ".emf", "application/postscript", ".sketch", ".svg", ".vsdx"],
	type: "vector-image",
};

export const validVideoTypes = {
	ext: ["video/mp4", "video/avi", "video/mov", "video/wmv", "video/m4v"],
	type: "video",
};

export const validAllTypes = [
	validArchiveTypes,
	validConfigTypes,
	validDataTypes,
	validDatabaseTypes,
	validDeveloperFilesTypes,
	validDiskImageTypes,
	validDocumentTypes,
	validFontTypes,
	validHTMLTypes,
	validImageTypes,
	validMessageTypes,
	validMusicTypes,
	validPageLayoutTypes,
	validPdfType,
	validPresentationTypes,
	validProgramTypes,
	validSpreadsheetTypes,
	validTextTypes,
	validThreeDImageTypes,
	validVectorImageTypes,
	validVideoTypes,
];
