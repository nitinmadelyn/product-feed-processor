const sax = require("sax");

describe("XML Parser", () => {

    test("extracts product fields", done => {

        const xml = `
            <rss>
                <channel>
                <item>
                    <g:id>1</g:id>
                    <title>Test</title>
                    <description>Hello</description>
                </item>
                </channel>
            </rss>
            `;

        const parser = sax.createStream(true);

        let item = {};

        parser.on("opentag", node => {
            if (node.name === "item") item = {};
        });

        parser.on("text", text => {
            const val = text.trim();
            if (!val) return;

            if (!item.id) item.id = val;
        });

        parser.on("end", () => {
            expect(item.id).toBeDefined();
            done();
        });

        parser.write(xml);
        parser.end();
    });

});