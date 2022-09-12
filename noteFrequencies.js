var noteFrequencies = [];

(function()
{
    noteFrequencies[69] = 440;
    var ratio = Math.pow(2, 1/12);
    for (let i = 69; i > 12; i--)
    {
        noteFrequencies[i - 1] = noteFrequencies[i] / ratio;
    }
    for (let i = 69; i < 120; i++)
    {
        noteFrequencies[i + 1] = noteFrequencies[i] * ratio;
    }
})();


export default noteFrequencies;
