export default class NoteSource
{
    #connectedNodes;
    #name;

    constructor({name = ''})
    {
        this.#connectedNodes = [];
        this.#name = name;
    }

    get name() { return this.#name; }

    playNote(frequency)
    {
        for (let i = 0; i < this.#connectedNodes.length; i++)
        {
            this.#connectedNodes[i].playNote(frequency);
        }
    }

    stopNote(frequency)
    {
        for (let i = 0; i < this.#connectedNodes.length; i++)
        {
            this.#connectedNodes[i].stopNote(frequency);
        }
    }

    connect(node)
    {
        if (typeof node.playNote === 'function' && typeof node.stopNote === 'function')
            this.#connectedNodes.push(node);
        else
            throw new Error("The connected node does not have a playNote and stopNote method.");
        return node;
    }

    disconnect(node)
    {
        let id = this.#connectedNodes.indexOf(node);
        if (id > -1)
        {
            this.#connectedNodes.splice(id, 1);
        }
    }
}