import express, { static as _static } from "express";
import * as fs from 'fs';
const app = express();

// setting application's templating engine to ejs
app.set("view engine", "ejs");

app.use(_static('public'));
app.use(express.json());

app.get("/", (req, res) => {
    const txt=fs.readFileSync('data/sources.json');
    const json=JSON.parse(txt);
    const sources=json.categories;
    let sourceTable=[];
    for(let i=0;i<sources.length;i+=3){
        let row=[sources[i]];
        if(i+1<sources.length){
            row.push(sources[i+1]);
        }if(i+2<sources.length){
            row.push(sources[i+2]);
        }
        sourceTable.push(row);
    }
    res.render("pages/index",{sources: sourceTable});
});

app.get("/:category/list", (req, res) => {
    const txt=fs.readFileSync('data/sources.json');
    const json=JSON.parse(txt);
    let c=0;
    while(c<json.categories.length){
        if(json.categories[c].name==req.params.category){
            break;
        }c++;
    }
    const sources=json.categories[c].sources;
    // Pre-calculate the average rating for each source
    for(const source of sources){
        let avgRating=0;
        if(source.reviews.length>0){
            for(const r of source.reviews){
                avgRating+=r.rating;
            }
            avgRating = Math.round(avgRating/parseFloat(source.reviews.length+''));
        }
        source.rating = avgRating;
    }
    res.render("pages/sourcelist",{sources: sources, category: json.categories[c].name});
});

/*
app.get("/art", (req, res) => {
    const txt=fs.readFileSync('data/sources.json');
    const json=JSON.parse(txt);
    const sources=json.categories[1].sources;
    // Pre-calculate the average rating for each source
    for(const source of sources){
        let avgRating=0;
        if(source.reviews.length>0){
            for(const r of source.reviews){
                avgRating+=r.rating;
            }
            avgRating = Math.round(avgRating/parseFloat(source.reviews.length+''));
        }
        source.rating = avgRating;
    }
    res.render("pages/category_pages/art",{sources: sources, category: json.categories[1].name});
});

app.get("/cs", (req, res) => {
    const txt=fs.readFileSync('data/sources.json');
    const json=JSON.parse(txt);
    const sources=json.categories[2].sources;
    // Pre-calculate the average rating for each source
    for(const source of sources){
        let avgRating=0;
        if(source.reviews.length>0){
            for(const r of source.reviews){
                avgRating+=r.rating;
            }
            avgRating = Math.round(avgRating/parseFloat(source.reviews.length+''));
        }
        source.rating = avgRating;
    }
    res.render("pages/category_pages/cs",{sources: sources, category: json.categories[2].name});
});*/

app.get("/:category/add", (req, res) => {
    res.render("pages/add",{category: req.params.category});
});

app.get("/:category/:source/reviews", (req, res) => {
    // Get JSON database
    const json=JSON.parse(fs.readFileSync('data/sources.json'));
    // Search for the source and its review list
    let sourcelist=[];
    let c=0;
    while(c<json.categories.length){
        if(json.categories[c].name==req.params.category){
            sourcelist=json.categories[c].sources;
            break;
        }c++;
    }
    let reviews=[];
    let s=0;
    while(s<sourcelist.length){
        if(sourcelist[s].name==req.params.source){
            reviews=sourcelist[s].reviews;
            break;
        }s++;
    }
    // Pre-calculate the average rating
    let avgRating=0;
    for(const r of reviews){
        avgRating+=r.rating;
    }
    avgRating = avgRating/parseFloat(reviews.length+'');
    avgRating = Math.round(avgRating*10)/10.0;
    if(reviews.length==0){
        avgRating = 'No reviews';
    }
    // Return data to the webpage
    const body={
        title: req.params.source,
        link: sourcelist[s].link,
        category: req.params.category,
        reviews: reviews,
        average: avgRating
    };
    res.render("pages/source",body);
});

app.post("/review", (req,res) => {
    console.log(req.body);
    // Get JSON database
    const json=JSON.parse(fs.readFileSync('data/sources.json'));
    // Search for the source and its review list
    let sourcelist=[];
    let c=0;
    while(c<json.categories.length){
        if(json.categories[c].name==req.body.category){
            sourcelist=json.categories[c].sources;
            break;
        }c++;
    }
    let s=0;
    while(s<sourcelist.length){
        if(sourcelist[s].name==req.body.source){
            break;
        }s++;
    }
    // Create a new review and add it to the list
    let newreview={
        'username': req.body.name,
        'rating': req.body.rating,
        'comment': req.body.comment
    }
    json.categories[c].sources[s].reviews.push(newreview);
    fs.writeFileSync('data/sources.json',JSON.stringify(json));
});

app.post("/addResource", (req,res) => {
    console.log(req.body);
    // Get JSON database
    const json=JSON.parse(fs.readFileSync('data/sources.json'));
    // Search for the source and its review list
    let c=0;
    while(c<json.categories.length){
        if(json.categories[c].name==req.body.category){
            break;
        }c++;
    }
    // Create a new resource and add it to the list
    let newsource={
        'name': req.body.name,
        'link': req.body.link,
        'type': req.body.type,
        'reviews': []
    }
    json.categories[c].sources.push(newsource);
    fs.writeFileSync('data/sources.json',JSON.stringify(json));
});

const PORT = 3000;
app.listen(PORT);
console.log('Server active on port: ' + PORT);