// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import chrome from "chrome-aws-lambda";
// import puppeteer from "puppeteer-core";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

type Data =
  | {
      iframeUrl: string;
    }
  | {
      error: {
        message: string;
      };
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  let browser;

  try {
    const { url } = req.query;

    if (!url) {
      throw new Error("No URL provided");
    }

    browser = await puppeteer.launch({
      executablePath: await chrome.executablePath,
      // executablePath: "/usr/bin/google-chrome-stable",
      args: chrome.args,
      // headless: false,
      defaultViewport: {
        width: 1920,
        height: 1080,
        isMobile: false,
        hasTouch: false,
        isLandscape: false,
      },
    });
    const page = await browser.newPage();

    await page.goto(url as string);

    //get src of .embed-responsive-item
    const src = await page.evaluate(() => {
      const img = document.querySelector(".embed-responsive-item");
      if (img) {
        return (img as any).src;
      }
      return null;
    });

    if (src) {
      res.status(200).json({
        iframeUrl: src,
      });
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  } finally {
    // await browser?.close();
  }
}

function getValue(arg0: string): string {
  throw new Error("Function not implemented.");
}

// await page.setRequestInterception(true);
// const result: {
//   request_url: any;
//   request_headers: any;
//   request_post_data: any;
//   response_headers: any;
//   response_size: any;
//   response_body: any;
// }[] = [];

// page.on("request", (request) => {
//   request_client({
//     uri: request.url(),
//     resolveWithFullResponse: true,
//   })
//     .then((response: { headers: any; body: any }) => {
//       const request_url = request.url();
//       const request_headers = request.headers();
//       const request_post_data = request.postData();
//       const response_headers = response.headers;
//       const response_size = response_headers["content-length"];
//       const response_body = response.body;

//       result.push({
//         request_url,
//         request_headers,
//         request_post_data,
//         response_headers,
//         response_size,
//         response_body,
//       });

//       // console.log(result);
//       request.continue();
//     })
//     .catch((error: any) => {
//       console.error(error);
//       request.abort();
//     });
// });
