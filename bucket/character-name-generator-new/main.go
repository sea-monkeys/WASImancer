package main

import (
	"math/rand"
	"strings"
	"time"

	"github.com/extism/go-pdk"
)

// Word lists for generating heroic fantasy names
var (
	// First parts of names
	prefixes = []string{
		"Aer", "Aeth", "Ald", "Ar", "Arag", "Azur", "Bal", "Bel", "Bor", "Bran",
		"Cal", "Cael", "Dag", "Dar", "Dor", "Drav", "Eld", "El", "Ereb", "Fen",
		"Fir", "Frey", "Gal", "Gan", "Gar", "Gil", "Grim", "Gwyn", "Hal", "Har",
		"Hel", "Isen", "Jar", "Jor", "Kal", "Kar", "Kaz", "Kord", "Lad", "Lan",
		"Lor", "Luth", "Mal", "Mith", "Mor", "Nath", "Nor", "Pal", "Rav", "Raz",
		"Ren", "Roan", "Sev", "Shan", "Sil", "Storm", "Thal", "Thor", "Thran", "Tyr",
		"Ul", "Vald", "Var", "Vol", "Vor", "War", "Wulf", "Zar", "Zen", "Zeph",
	}

	// Middle parts (optional)
	middles = []string{
		"ad", "am", "an", "ar", "as", "az", "bar", "bor", "dar", "del",
		"din", "dor", "dran", "dur", "gal", "grim", "ian", "ith", "kan", "kath",
		"lach", "lan", "lian", "loch", "lor", "mar", "mond", "mor", "nar", "nir",
		"or", "rad", "rail", "ran", "riel", "rin", "rion", "ris", "ron", "sar",
		"ser", "sil", "stor", "thal", "thar", "ther", "thr", "tin", "tor", "val",
		"van", "var", "vor", "wan", "wer", "wyn", "", "", "", "",
	}

	// Last parts of names
	suffixes = []string{
		"adan", "ain", "aine", "ak", "al", "alas", "ald", "ali", "am", "an",
		"ar", "aran", "ard", "ath", "ayne", "bane", "born", "brand", "bringer", "dar",
		"din", "dor", "doth", "dred", "drim", "ean", "el", "eon", "ere", "esh",
		"fire", "forge", "gard", "gorn", "grim", "heart", "ien", "ik", "il", "ion",
		"ior", "is", "ius", "lor", "more", "nir", "oc", "or", "orn", "oth",
		"rad", "rak", "ram", "riel", "rim", "rin", "roth", "seer", "sen", "shire",
		"slayer", "star", "storm", "thal", "thar", "thien", "thorn", "thul", "us", "vain",
		"vane", "ward", "wick", "wind", "wise", "wrath", "wyck", "wyn", "wynn", "yr",
	}

	// Titles/Epithets for more epic names
	titles = []string{
		"the Brave", "the Bold", "Dragonslayer", "Stormbringer", "the Wise", "the Mighty",
		"Oathkeeper", "Shadowbane", "the Unyielding", "Lightbringer", "Flameheart", "Doomhammer",
		"the Vengeful", "Bane of Darkness", "Champion of Light", "the Undaunted", "Kingslayer",
		"Demonbane", "the Arcane", "Spellweaver", "Soulforger", "the Relentless", "Frostbringer",
		"Truthseeker", "the Valiant", "Guardian of the Realm", "the Immortal", "Titan's Hand",
		"the Just", "Protector of the Weak", "the Unchained", "Godbane", "the Magnificent",
		"Wyrmslayer", "the Crimson", "the Azure", "the Emerald", "the Golden", "the Silver",
		"the Obsidian", "", "", "", "", "", "", "", "", "", "", "", "", "",
	}
)



//export GenerateCharacterName
func GenerateCharacterName() {

	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	

	// Get random parts
	prefix := prefixes[r.Intn(len(prefixes))]
	
	// 70% chance to use a middle part
	var middle string
	if r.Float64() < 0.7 {
		middle = middles[r.Intn(len(middles))]
	}
	
	suffix := suffixes[r.Intn(len(suffixes))]
	
	// 40% chance to add a title
	var title string
	if r.Float64() < 0.4 {
		title = " " + titles[r.Intn(len(titles))]
	}
	
	// Combine the parts and ensure proper capitalization
	name := strings.Title(strings.ToLower(prefix + middle + suffix)) + title
	
	// return the value
	// copy output to host memory
	mem := pdk.AllocateString(name)
	pdk.OutputMemory(mem)
	
}

func main() {
	
}

