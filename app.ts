import * as express from 'express';
import { Application, Request, Response } from 'express';
import * as bodyParser from 'body-parser';
import * as jsdom from 'jsdom';

const app: Application = express();

const port: number = 8080;
const { JSDOM } = jsdom;

app.use(bodyParser.json());

const findFavAndEmail = async (req: Request, res: Response) => {
  const urlRegex: RegExp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
  const url = req.body['url'];
  if (!urlRegex.test(url)) {
    return res.status(400).json({ message: 'Please enter a valid URL' });
  }
  await JSDOM.fromURL(url)
    .then(dom => {
      let favicon: string, email: string;
      const favRegex: RegExp = /favicon/;
      const mailRegex: RegExp = /mailto/;
      const headNodes = dom.window.document.querySelectorAll('head')[0]
        .childNodes;
      const anchorNodes = dom.window.document
        .querySelectorAll('body')[0]
        .getElementsByTagName('a');
      for (let i = 0; i < headNodes.length; i++) {
        if (favRegex.test(headNodes[i]['href'])) {
          favicon = headNodes[i]['href'];
        }
      }
      for (let i = 0; i < anchorNodes.length; i++) {
        if (mailRegex.test(anchorNodes[i].href)) {
          email = anchorNodes[i].href.slice(7);
        }
      }
      if (!favicon && !email) {
        return res.status(404).json({ message: 'Not found' });
      } else if (favicon && !email) {
        return res.status(200).json({ favicon });
      } else {
        return res.status(200).json({ favicon, email });
      }
    })
    .catch(err => {
      return res.status(500).json({ message: 'Something went wrong' });
    });
};

app.post('/', findFavAndEmail);

app.listen(port, () => {
  console.log(`Server started on ${port}`);
});
