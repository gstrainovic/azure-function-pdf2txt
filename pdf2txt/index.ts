import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import HTTP_CODES from "http-status-enum";
import * as multipart from "parse-multipart";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<any> {
	context.log('**************************************************');
	context.log('upload HTTP trigger function processed a request.');

	if (!context.res) {
		const error = 'No response possible'
		context.log.error(error);
		return context.res
	}
	else if (!req.headers["content-type"]) {
		const error = 'content-type is unknown'
		context.log.error(error);
		context.res.body = `${error}`;
		context.res.status = HTTP_CODES.INTERNAL_SERVER_ERROR
		return context.res
	}
	else {

		// const inputstring = req.headers.regex

		// if (!inputstring) {
		// 	const error = 'No regex defined'
		// 	context.log.error(error);
		// 	{
		// 		context.res.body = `${error}`;
		// 		context.res.status = HTTP_CODES.INTERNAL_SERVER_ERROR
		// 		return context.res
		// 	}
		// } else {


		// 	const flags = inputstring.replace(/.*\/([gimy]*)$/, '$1');
		// 	const pattern = inputstring.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
		// 	const MyRegex = new RegExp(pattern, flags);


		if (!req.body || !req.body.length) {
			context.res.body = `Request body is not defined`;
			context.res.status = HTTP_CODES.BAD_REQUEST
		}

		try {
			// Each chunk of the file is delimited by a special string
			const bodyBuffer = Buffer.from(req.body);
			const boundary = multipart.getBoundary(req.headers["content-type"]);
			const parts = multipart.Parse(bodyBuffer, boundary);

			// The file buffer is corrupted or incomplete ?
			if (!parts?.length) {
				context.res.body = `File buffer is incorrect`;
				context.res.status = HTTP_CODES.BAD_REQUEST
			}
			if (parts[0]?.filename) console.log(`Original filename = ${parts[0]?.filename}`);
			if (parts[0]?.type) console.log(`Content type = ${parts[0]?.type}`);
			if (parts[0]?.data?.length) console.log(`Size = ${parts[0]?.data?.length}`);

			// context.log({ MyRegex })

			const options = {
				"numericPrecision": 0,
				"nonWhitespaceRegexp": "/\\S/",
				"replaceMultipleSpaces": true,
				"orderByYPos": true,
				"distanceToAddSpace": 2
			}

			const buffer = parts[0]?.data;
			const tm = require('textmeta');
			const textMeta = await tm.extractFromPDFBuffer(buffer, [], options)
			const text: string = textMeta.text
			// const barcodeAr = MyRegex.exec(text)

			// const barcode = barcodeAr ? barcodeAr[1] : 'Barcode not found with Regex'

			// context.log({ barcode })

			const output = {
				// barcode: barcode,
				text: text
			}

			// returned to requestor
			context.res.body = output // text//`${req.query?.username}/${req.query?.filename}`;
		} catch (err: any) {
			context.log.error(err.message);
			{
				context.res.body = `${err.message}`;
				context.res.status = HTTP_CODES.INTERNAL_SERVER_ERROR
			}
		}
		return context.res;
	}
}

export default httpTrigger;
