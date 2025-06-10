import "dotenv/config";
import tumblr from "tumblr.js";
import NekoAPI from "@indiefellas/nekoweb-api";
import arrayShuffle from "array-shuffle";

const tummy = new tumblr.Client({
    consumer_key: process.env.BLR_KEY
})
const neko = new NekoAPI({
    apiKey: process.env.NEKO_KEY,
});
const postToID = (post) => post.match(/https?:\/\/[\w-]+\.tumblr\.com\/post\/(\d+)/)?.[1];

(async () => {
    const tummies = await (await fetch("https://hakase.nekoweb.org/newtab/tummies.json")).json();
    const tummyIDs = tummies.map(tum => postToID(tum));

    let offset = 0;

    while (true) {
        const postBatch = (await tummy.blogPosts("nyakase", {offset}))
            .posts.map(post => ({url: post.post_url, id: post.id}))
            .filter(post => !tummyIDs.includes(post.id))

        if(postBatch.length > 0) {
            offset += 20;
            postBatch.forEach(post => {
                console.log(post.url);
                tummies.push(post.url);
                tummyIDs.push(post.id);
            })
        } else {
            break;
        }
    }

    await neko.edit("/newtab/tummies.json", JSON.stringify(arrayShuffle(tummies)));
    await neko.edit("/newtab/tummies.time", new Date().getTime())
})();