$(document).ready(function () {
    var graph = new LGraph();
    var canvas = new LGraphCanvas("#mycanvas", graph);

    // Adjust canvas size to window
    function resizeCanvas() {
        canvas.resize(window.innerWidth - 300, window.innerHeight);
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    graph.start();

    // Custom Dialogue Node Type
    function DialogueNode() {
        this.addInput("in", "string");
        this.addOutput("Link1", "string");
        this.addOutput("Link2", "string");
        this.addOutput("Link3", "string");
        this.addOutput("Link4", "string");
        this.properties = {
            speaker: "",
            dialogueType: "",
            action: "",
            param: "",
            link1: 0,
            link2: 0,
            link3: 0,
            link4: 0,
            mood: "",
            dialogueLine: ""
        };
        this.title = "Dialogue Node";
        this.size = [200, 100];
    }

    DialogueNode.title = "Dialogue Node";

    DialogueNode.prototype.onExecute = function () {
        // Pass data if needed
    };

    // Draw background based on DialogueType
    DialogueNode.prototype.onDrawBackground = function (ctx) {
        if (this.flags.collapsed) return;

        var type = this.properties.dialogueType.toLowerCase();
        if (type === "choice") {
            ctx.fillStyle = "#0000AA"; // Blue
        } else if (type === "enddialogue") {
            ctx.fillStyle = "#AA0000"; // Red
        } else {
            ctx.fillStyle = "#222"; // Default
        }
        ctx.fillRect(0, 0, this.size[0], this.size[1]);
    };

    // Draw text
    DialogueNode.prototype.onDrawForeground = function (ctx) {
        if (this.flags.collapsed) return;

        ctx.fillStyle = "#AAA";
        ctx.font = "12px Arial";
        ctx.fillText("Speaker: " + this.properties.speaker, 10, 20);
        ctx.fillText("Type: " + this.properties.dialogueType, 10, 35);

        // Truncate dialogue line
        var line = this.properties.dialogueLine;
        if (line.length > 25) line = line.substr(0, 25) + "...";
        ctx.fillText(line, 10, 50);
    };

    LiteGraph.registerNodeType("dialogue/node", DialogueNode);

    // Add Node Button
    $("#add-node-btn").click(function () {
        var node = LiteGraph.createNode("dialogue/node");
        node.pos = [200, 200];
        graph.add(node);
    });

    // Node Selection for Editing
    var selectedNode = null;

    canvas.onNodeSelected = function (node) {
        selectedNode = node;
        if (node.type === "dialogue/node") {
            $("#node-properties").show();
            $("#prop-speaker").val(node.properties.speaker);
            $("#prop-type").val(node.properties.dialogueType);
            $("#prop-action").val(node.properties.action);
            $("#prop-param").val(node.properties.param);
            $("#prop-link1").val(node.properties.link1);
            $("#prop-link2").val(node.properties.link2);
            $("#prop-link3").val(node.properties.link3);
            $("#prop-link4").val(node.properties.link4);
            $("#prop-mood").val(node.properties.mood);
            $("#prop-line").val(node.properties.dialogueLine);
        } else {
            $("#node-properties").hide();
        }
    };

    canvas.onNodeDeselected = function (node) {
        selectedNode = null;
        $("#node-properties").hide();
    };

    // Update Node Properties
    $("#update-node-btn").click(function () {
        if (selectedNode) {
            selectedNode.properties.speaker = $("#prop-speaker").val();
            selectedNode.properties.dialogueType = $("#prop-type").val();
            selectedNode.properties.action = $("#prop-action").val();
            selectedNode.properties.param = $("#prop-param").val();
            selectedNode.properties.link1 = parseInt($("#prop-link1").val()) || 0;
            selectedNode.properties.link2 = parseInt($("#prop-link2").val()) || 0;
            selectedNode.properties.link3 = parseInt($("#prop-link3").val()) || 0;
            selectedNode.properties.link4 = parseInt($("#prop-link4").val()) || 0;
            selectedNode.properties.mood = $("#prop-mood").val();
            selectedNode.properties.dialogueLine = $("#prop-line").val();
            selectedNode.setDirtyCanvas(true, true);
        }
    });

    // TSV Import
    $("#import-tsv-btn").click(function () {
        var tsv = $("#tsv-input").val();
        var lines = tsv.split("\n");
        var nodesMap = {}; // Map ID to Node
        var createdNodes = [];

        // Clear graph
        graph.clear();

        // Parse lines and create nodes
        // Assuming format: ID (implicit?), Speaker, DialogueType, Action, Param, Link1, Link2, Link3, Link4, Mood, DialogueLine
        // The user example: "	Condition	HasClue	InterrogateTheGirls	33	34					"
        // It seems the first column is empty or ID?
        // Let's assume the user provided example columns:
        // Col 0: Speaker? (Empty in first row) -> "RobHarley" in 2nd row
        // Col 1: DialogueType? ("Condition")
        // Col 2: Action? ("HasClue")
        // Col 3: Param? ("InterrogateTheGirls")
        // Col 4: Link1 ("33")
        // Col 5: Link2 ("34")
        // Col 6: Link3
        // Col 7: Link4
        // Col 8: Mood
        // Col 9: DialogueLine

        // Wait, the user example is a bit ambiguous on ID.
        // "	Condition	HasClue	InterrogateTheGirls	33	34					"
        // "RobHarley				3					Hey man..."
        // "ArchibaldFiggs				4				Salute	No beer here..."

        // If Link1 is 33, where is ID 33?
        // Maybe the line number is the ID? Or there is a hidden ID column?
        // Let's assume line index (1-based) is the ID for now, or try to find an ID column if present.
        // Actually, looking at "RobHarley				3					Hey man...", it has "3" in Link1 column?
        // The user said: "Link1 : int (lien par défaut vers un autre node)"

        // Let's assume standard columns based on the request list:
        // 0: Speaker
        // 1: DialogueType
        // 2: Action
        // 3: Param
        // 4: Link1
        // 5: Link2
        // 6: Link3
        // 7: Link4
        // 8: Mood
        // 9: DialogueLine

        // Let's try to parse based on tabs.

        var y = 100;
        var x = 100;

        lines.forEach(function (line, index) {
            line = line.trim();
            if (!line) return;

            var parts = line.split("\t");
            // Handle potential empty parts at start if copy-paste issue, but split should handle empty strings.

            // If the user pasted from Excel, it might have tabs.

            var node = LiteGraph.createNode("dialogue/node");
            node.pos = [x, y];

            // Map columns
            node.properties.speaker = parts[0] || "";
            node.properties.dialogueType = parts[1] || "";
            node.properties.action = parts[2] || "";
            node.properties.param = parts[3] || "";
            node.properties.link1 = parseInt(parts[4]) || 0;
            node.properties.link2 = parseInt(parts[5]) || 0;
            node.properties.link3 = parseInt(parts[6]) || 0;
            node.properties.link4 = parseInt(parts[7]) || 0;
            node.properties.mood = parts[8] || "";
            node.properties.dialogueLine = parts[9] || "";

            // Use index + 1 as ID for now since no ID column specified
            node.id = index + 1;
            nodesMap[node.id] = node;
            createdNodes.push(node);

            graph.add(node);

            y += 150;
            if (y > 2000) {
                y = 100;
                x += 400;
            }
        });

        // Create links
        createdNodes.forEach(function (node) {
            if (node.properties.link1 && nodesMap[node.properties.link1]) {
                node.connect(0, nodesMap[node.properties.link1], 0);
            }
            if (node.properties.link2 && nodesMap[node.properties.link2]) {
                node.connect(1, nodesMap[node.properties.link2], 0);
            }
            if (node.properties.link3 && nodesMap[node.properties.link3]) {
                node.connect(2, nodesMap[node.properties.link3], 0);
            }
            if (node.properties.link4 && nodesMap[node.properties.link4]) {
                node.connect(3, nodesMap[node.properties.link4], 0);
            }
        });
    });
});
