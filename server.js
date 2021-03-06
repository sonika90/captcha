const Express = require("express")
const bodyParser = require("body-parser")
const svgCaptcha = require("svg-captcha")
const cuid = require("cuid")
const Redis = require("ioredis")
const http = require("http")
const cors = require("cors")

require("dotenv").config()

const {
    PORT,
    REDIS_CONNECT_STRING,
    REQUIRE_AUTH,
    ACCESS_TOKEN,
    REDIS_NAMESPACE
} = process.env

const app = Express()
const redis = new Redis(REDIS_CONNECT_STRING)

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const server = http.createServer(app)

const checkAuthMiddleware = function(req, res, next) {
    if (REQUIRE_AUTH.toLowerCase() !== "yes") return next()
    try {
        const token = req.get("authorization").split(" ").pop()
        if (ACCESS_TOKEN === token) return next()
        throw new Error()
    } catch (error) {
        return res.status(403).send("INVALID OR MISSING ACCESS TOKEN")
    }
}

/**
 *
 * @api {post} /generate Generate the Captcha
 * @apiName GenerateCaptcha
 *
 * @apiHeader {String} [Authorization] The Access Token in format "Token xxxxyyyyzzzz"
 *
 * @apiParam  {Boolean} [color=true] Whether the captcha image should be in colors
 * @apiParam  {String} [background='#ffffff'] Background color
 * @apiParam  {String} [size=4] Length of Captcha text
 * @apiParam  {Number} [timeout=10] Timeout in Minutes
 *
 * @apiSuccessExample {JSON} Success-Response: 200 OK
 *    {
 *      key: "xyz123abc",
 *      captchaSvg: "<svg ..... /svg>"
 *    }
 */
app.post("/generate", checkAuthMiddleware, async(req, res) => {
        const {
            color = true,
                background = "#ffffff",
                size = 6,
                timeout: timeOutInMinutes = 10
        } = req.body
        try {
            const { data: captchaSvg, text: captchaText } = svgCaptcha.create({ color, background, size })
            const key = cuid()
            await redis.set(`${REDIS_NAMESPACE}:${key}`, captchaText, "EX", timeOutInMinutes * 60)

            return res.status(200).json({ key, captchaSvg: captchaSvg.replace(/"/g, "'") })
        } catch (e) {
            console.log("==> ERR generating Captcha: ", e);
            return res.status(500).json({ message: e.message })
        }
    })
    /**
     *
     * @api {post} /validate Validate the Captcha
     * @apiName ValidateCaptcha
     *
     * @apiHeader {String} [Authorization] The Access Token in format "Token xxxxyyyyzzzz"
     *
     * @apiParam  {String} text The captcha text response to validate
     * @apiParam  {String} key The unique key for captcha
     */
app.post("/validate", checkAuthMiddleware, async(req, res) => {
    const { text, key } = req.body
    if (text === undefined || key === undefined) return res.status(400).send("Fields 'text' & 'key' are both mandatory!")
    try {
        const storedText = await redis.get(`${REDIS_NAMESPACE}:${key}`)
        if (storedText === null) throw new Error("Expired Captcha!")
        if (storedText !== text) throw new Error("Invalid Captcha!")
        await redis.del(`${REDIS_NAMESPACE}:${key}`)
        return res.status(200).json({ message: "Valid Captcha!", success: true })
    } catch (e) {
        console.log("==> ERR validating Captcha: ", e);
        return res.status(500).json({ message: e.message, success: false })
    }
})

server.listen(PORT || 9091, () => {
    console.log(`Example app listening on port ${PORT}`)
})






////////////////

// let fs = require('fs');

// let handleRequest = (request, response) => {
//     response.writeHead(200, {
//         'Content-Type': 'text/html'
//     });
//     fs.readFile('./index.html', null, function(error, data) {
//         if (error) {
//             response.writeHead(404);
//             respone.write('Whoops! File not found!');
//         } else {
//             response.write(data);
//         }
//         response.end();
//     });
// };

// http.createServer(handleRequest).listen(8000);



//const http = require("http");
const fs = require("fs");
const path = require("path");
//const PORT = 8080;
http
    .createServer(({ url }, response) => {
        response.setHeader("Content-Type", "text/html");
        if (url == "/") fs.createReadStream("./index.html").pipe(response);
        else {
            const filePath = path.join(__dirname, url);
            const stats = fs.existsSync(filePath);
            if (stats) fs.createReadStream(filePath).pipe(response);
        }
    })
    .listen(8000);