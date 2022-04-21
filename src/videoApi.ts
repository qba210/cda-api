import axios from "axios";
import cheerio, { Cheerio } from "cheerio";
import { PlayerData } from "./interfaces";

let doc: Document;
let win: Window | any;
if (typeof document !== 'undefined'){
    const { DOMWindow, JSDOM } = require("jsdom");
    const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`);
    doc = dom.window.document;
    win = dom.window;
}else{
    doc = document;
    win = window;
}

axios.defaults.withCredentials = true;

export interface VideoData{
    duration: string;
    title: string;
    author: string;
    rating: number;
    description: string;
    tags: string[];
    comments: Comment[];
}

export interface Comment{
    isAnonymous: boolean;
    content: string;
    date: Date;
    avatarURL?: string;
    username: string;
    ip?: string;
    likes: number;
    sendFromMobile: boolean;
    parentOf?: Comment;
}

export interface Date{
    day: number;
    month: number;
    year: number;
    hour: number;
    minute: number;
    second: number;
}

export class CdaVideoApi{
    private id: string;
    private playerData: PlayerData;

    private constructor(id: string, playerData: PlayerData){
        this.id = id;
        this.playerData = playerData;
    }

    private static async construct(id: string): Promise<CdaVideoApi>{
        let vid = await axios.get(`https://www.cda.pl/video/${id}`, {withCredentials: true});
        let $ = cheerio.load(vid.data);
        return new CdaVideoApi(id, JSON.parse($(`div#mediaplayer${id}`).prop("player_data")));
    }

    static async fromID(id: string): Promise<CdaVideoApi>{
        return await CdaVideoApi.construct(id);
    }

    static async fromURL(url: string): Promise<CdaVideoApi>{
        let surl = url.split("/").reverse();
        let id;
        if (surl[0] === "vfilm"){
            surl.reverse().pop();
            surl.reverse();
        }
        id = surl[0];
        return CdaVideoApi.construct(id);
    }

    /**
     * 
     * @returns Qualities of video (value of map is needed to get video url)
     */
    getQualities(): Map<string, string>{
        let ret = new Map<string, string>();
        Object.entries(this.playerData.video.qualities).forEach(([key, value]) => {
            ret.set(key, value);
        });
        return ret;
    }

    /**
     * 
     * @param quality Quality of video (get from getQualities())
     * @returns Direct (downloadable) url of video
     */
    async getVideoLink(quality: string): Promise<string>{
        let hash = this.playerData.video.hash2;
        let key = parseInt(this.playerData.api.ts.split("_")[0]);
        let pos = await axios({
            method: "post",
            url: "https://www.cda.pl/video/9412059ee",
            headers: {
                "content-type": "application/json"
            },
            data: {"jsonrpc":"2.0","method":"videoGetLink","params":[this.id,quality,key,hash,{}],"id":3},
            withCredentials: true
        });
        return pos.data.result.resp;
    }
    async addComment(comment: string){
        let res = await axios.post("https://www.cda.pl/a/comment", JSON.stringify({
            t: comment
        }), {withCredentials: true});
        // const params = new URLSearchParams();
        // params.append("t", comment);
        // let res = await axios({
        //     method: "post",
        //     url: "https://www.cda.pl/a/comment",
        //     headers: {
        //         "content-type": "application/x-www-form-urlencoded"
        //     },
        //     data: params,
        //     withCredentials: true
        // })
        console.log(res);
    }

    async getVideoData(commentSorting: "popular" | "newest" = "popular"): Promise<VideoData>{
        let comsort = commentSorting === "popular" ? "najpopularniejsze" : "najnowsze";

        let $ = cheerio.load((await axios.get(`https://www.cda.pl/video/${this.id}`)).data);
        let duration = $("span.pb-max-time").text();
        let title = $("span.title-name").children("h1").text();
        let description = $('span[itemprop="description"]').html()?.replace(/<br>/g, "\n") as string;
        let rating = parseInt(($('span.rateMedVal').prop("style").width as string).replace("px", "")) / 32;
        let author = $("span.color-link-primary").text();
        let tags = $("a.tag-element").map((i, el) => $(el).text()).get();

        let comres = (await axios.post(`https://www.cda.pl/video/${this.id}`, {"jsonrpc":"2.0","method":"changeSortComment","params":[this.id.substring(0, this.id.length - 2),"video",comsort,{}],"id":6}, {withCredentials: true}));
        let com = cheerio.load(comres.data.result);
        console.log(this.id.substring(0, this.id.length - 2));

        let commshtml = com("div[class*=kom_id_]").get().map(el => {let ele = doc.createElement("div"); ele.innerHTML = $.html(el); return ele});
        let comments: Comment[] = [];
        commshtml.forEach(ele => {
            const el = ele.children[0];
            let isAnonymous = !(!el.querySelector("span.anonim"));
            let sendFromMobile = el.querySelector('span.anonim[style*="float:left;margin-left:10px"]') != null;
            let content = el.querySelector("div.tresc")?.textContent?.replace(/\n.*\n.*\n.*Odpowiedz.*\n.*\n/g, "").substring(2).trim() as string;
            let ip: string | undefined = undefined;
            let likes = parseInt(el.querySelector("span.commentRate")?.textContent?.replace("+", "") as string);
            let datesArr = el.querySelector("span.commentDate1")?.textContent?.replace(" ", "-").replace(":", "-").split("-").map(el => parseInt(el)) as number[];
            let avatarURL: string | undefined = "";
            let username: string = "";
            if (isAnonymous){
                ip = el.querySelector('span[style*="float:left;margin-left:10px"]')?.textContent?.replace("(", "").replace(")", "").trim() as string | undefined;
                avatarURL = "https:" + el.querySelector('img')?.src;
                username = el.querySelector(".anonim")?.textContent?.trim() as string;
            }else{
                avatarURL = "https:" + el.querySelector('img')?.src;
                username = el.querySelector("a.autor1")?.textContent?.replace("\n", "").trim() as string;
            }
            let comment: Comment = {
                content,
                avatarURL,
                username,
                ip,
                likes,
                sendFromMobile,
                date: {
                    day: datesArr[2],
                    month: datesArr[1],
                    year: datesArr[0],
                    hour: datesArr[3],
                    minute: datesArr[4],
                    second: datesArr[5]
                },
                isAnonymous,
            }
            comments.push(comment);
        });
        return {
            title,
            description,
            rating,
            author,
            tags,
            duration,
            comments
        }
    }
}