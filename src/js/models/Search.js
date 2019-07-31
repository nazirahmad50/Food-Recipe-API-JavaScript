import axios from "axios";

export default class Search{
    constructor(query){
        this.query = query;

    }


async getResult(){
    const apiKey = "148bf047e0281698691ac94df4a13a9c";
    const corsProxy = "http://cors-anywhere.herokuapp.com/";
    try{
    // axios is same as fetch but better and automatically returns json and good at erro handling
    const res = await axios(`${corsProxy}https://www.food2fork.com/api/search?key=${apiKey}&q=${this.query}`); //this wil lreturn a promise
    this.result = res.data.recipes;

    }catch(err){
        console.log(err);
    }


}

}