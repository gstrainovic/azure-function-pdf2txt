import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import HTTP_CODES from "http-status-enum";
import * as multipart from "parse-multipart";
import { matchAll, matchs, RegExpFromString } from "./utils";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<any> {
    
    const createResponse = (text: string) => {
        const MyRegex = RegExpFromString(req.headers.regex);
        const matchAllResult = matchAll(text, MyRegex);

        const matches = matchAllResult.map(x => [{
                FullMatch: x[0], 
                ...x.groups
            }]
        )

        return [
            {
                Text: text,
                RegEx: req.headers.regex,
                Matches: matches
                // .flatMap((x) => [{ FullMatch: x ? [0] }])
                // datetime: x.groups?.datetime,
                // phone: x.groups?.phone,
                // url: x.groups?.url,
            }
        ]
    }
  context.log("**************************************************");
  context.log("upload HTTP trigger function processed a request.");

  if (!context.res) {
    const error = "No response possible";
    context.log.error(error);
    return context.res;
  } else if (!req.headers["content-type"]) {
    const error = "content-type is unknown";
    context.log.error(error);
    context.res.body = `${error}`;
    context.res.status = HTTP_CODES.INTERNAL_SERVER_ERROR;
    return context.res;
  } else if (!req.body || !req.body.length) {
    context.res.body = `Request body is not defined`;
    context.res.status = HTTP_CODES.BAD_REQUEST;
  } else if (!req.headers.regex) {
    const error = "No regex defined";
    context.log.error(error);
    {
      context.res.body = `${error}`;
      context.res.status = HTTP_CODES.INTERNAL_SERVER_ERROR;
      return context.res;
    }
  } else {
    try {
      if (req.headers["content-type"] !== "text/plain") {
        // Each chunk of the file is delimited by a special string
        const bodyBuffer = Buffer.from(req.body);
        const boundary = multipart.getBoundary(req.headers["content-type"]);
        const parts = multipart.Parse(bodyBuffer, boundary);

        // The file buffer is corrupted or incomplete ?
        if (!parts?.length) {
          context.res.body = `File buffer is incorrect`;
          context.res.status = HTTP_CODES.BAD_REQUEST;
        }
        if (parts[0]?.filename)
          console.log(`Original filename = ${parts[0]?.filename}`);
        if (parts[0]?.type) console.log(`Content type = ${parts[0]?.type}`);
        if (parts[0]?.data?.length)
          console.log(`Size = ${parts[0]?.data?.length}`);

        const options = {
          numericPrecision: 0,
          nonWhitespaceRegexp: "/\\S/",
          replaceMultipleSpaces: true,
          orderByYPos: true,
          distanceToAddSpace: 2,
        };

        const buffer = parts[0]?.data;
        const tm = require("textmeta");
        const textMeta = await tm.extractFromPDFBuffer(buffer, [], options);
        const text: string = textMeta.text;

        context.res.body = createResponse(text);
      } else {
        const text: string = req.body;

        context.res.body = createResponse(text);
      }
    } catch (err: any) {
      context.log.error(err.message);
      {
        context.res.body = `${err.message}`;
        context.res.status = HTTP_CODES.INTERNAL_SERVER_ERROR;
      }
    }

    return context.res;
  }
};

export default httpTrigger;
