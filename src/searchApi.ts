import axios from "axios";
import cheerio from "cheerio";
import { NotFoundError } from "./errors";

axios.defaults.withCredentials = true;

export interface SearchResult{
    title: string;
    miniatureURL: string;
    duriation: string;
    link: string;
}

export class CdaSearchApi{
    static async search(query: string, page: number = 1): Promise<SearchResult[]>{
        let res = await axios.get(`https://www.cda.pl/video/show/${query.replace(/[\/\\ ]/gm, "_")}/p${page}`);
        let resultsdoc = res.data;
        let $ = cheerio.load(resultsdoc);
        if ($('h2[style="float: none; display: block;"]').text() === "Strona, którą próbujesz oglądać nie istnieje") throw new NotFoundError(`Page ${page} not found`);
        let results = $("div.video-clip-wrapper");
        let ret: SearchResult[] = [];
        results.toArray().forEach((elem) => {
            let ele = cheerio.load($.html(elem));
            if (ele("a.folder-item")[0]) return;
            let time = ele("span.timeElem").text();
            let miniatureURL = "https:" + ele("img.video-clip-image").prop("src");
            let title = ele("a.link-title-visit").text();
            let link = "https://www.cda.pl" + ele("a.link-title-visit").attr("href"); 
            ret.push({
                title,
                miniatureURL,
                duriation: time,
                link
            })
        })
        return ret;
    }
}