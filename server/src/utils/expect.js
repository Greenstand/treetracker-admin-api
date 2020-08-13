class Matcher{}

class Any extends Matcher{
  constructor(sample){
    super();
    this.sample = sample;
  }

  equal(other){
    if (this.sample == String) {
      return typeof other == 'string' || other instanceof String;
    }

    if (this.sample == Number) {
      return typeof other == 'number' || other instanceof Number;
    }

    if (this.sample == Function) {
      return typeof other == 'function' || other instanceof Function;
    }

    if (this.sample == Object) {
      return typeof other == 'object';
    }

    if (this.sample == Boolean) {
      return typeof other == 'boolean';
    }

//    /* global BigInt */
//    if (this.sample == BigInt) {
//      return typeof other == 'bigint';
//    }

    if (this.sample == Symbol) {
      return typeof other == 'symbol';
    }

    return other instanceof this.sample;
  }

  toString(){
    return `any of ${this.sample}`;
  }
}

class Anything extends Matcher{
  equal(other){
    if(other !== undefined){
      return true;
    }else{
      return false;
    }
  }
}

class StringMatching extends Matcher{
  constructor(regex){
    super(regex);
    this.regex = regex;
  }

  equal(other){
    return (this.regex.test(other));
  }
}


class Expectation{

  constructor(actual){
    this.actual = actual;
    this.flags = [];
    this.lengthOf.above = (...args) => {
      this.addFlag("lengthOf");
      this.above(...args);
    }
    this.lengthOf.least = (...args) => {
      this.addFlag("lengthOf");
      this.least(...args);
    }
  }

  get to(){return this;}
  get be(){return this;}
  get been(){return this;}
  get is(){return this;}
  get and(){return this;}
  get has(){return this;}
  get have(){return this;}
  get with(){return this;}
  get that(){return this;}
  get which(){return this;}
  get at(){return this;}
  get of(){return this;}
  get same(){return this;}
  get but(){return this;}
  get does(){return this;}
  get still(){return this;}

  get not() {
    this.addFlag("not");
    return this;
  }

  addFlag(flag){
    this.flags.push(flag);
  }

  _equal(expectation){
    if(expectation instanceof Matcher){
      return expectation.equal(this.actual);
    }else{
      if(this.flags.includes("not")){
        return this.actual !== expectation;
      }else{
        return this.actual === expectation;
      }
    }
  }

  _equalWithActual(actual, expectation){
    if(expectation instanceof Matcher){
      return expectation.equal(actual);
    }else{
      if(this.flags.includes("not")){
        return actual !== expectation;
      }else{
        return actual === expectation;
      }
    }
  }

  defined(){
    if(this.flags.includes("not")){
      if(this.actual === undefined){
        //pass
        return this;
      }else{
        this.throw("not be defined");
      }
    }else{
      if(this.actual !== undefined){
        //pass
        return this;
      }else{
        this.throw("be defined");
      }
    }
  }

  number(){
    if(typeof this.actual === "number"){
      //pass
      return this;
    }else{
      this.throw("be number");
    }
  }

  property(propertyName){
    const propertyValue = this.actual[propertyName];
    console.log("!!!!!!!!!!!!!!!:", propertyValue);
    if(propertyValue === undefined){
      this.throw(`has property:${propertyName}`);
    }else{
      const expectation = new Expectation(propertyValue);
      return expectation;
    }
  }

  throw(expectMessage){
    let jsonString;
    try{
      jsonString = JSON.stringify(this.actual, null, 2);
    }catch(e){
      console.error("stringify failed:", e, "the source:", this.actual);
      jsonString = this.actual
    }
    let flagsString = this.flags.join(" ");
    throw Error(`[assert failed] expect ${jsonString} --to--> ${flagsString} ${expectMessage}`);
  }

  match(object){
    if(this.actual === undefined){
      this.throw(`match ${JSON.stringify(object, null, 2)}`);
    }
    if(object instanceof RegExp){
      if(!object.test(this.actual)){
        this.throw(`match ${object.toString()}`);
      }else{
        return this;
      }
    }else if(typeof object === "object"){
      let matched = true;
      Object.keys(object).forEach(key => {
        const value = object[key];
        const actualValue = this.actual[key];
        if(typeof value === "object" && !(value instanceof Matcher)){
          //nest object
          expect(actualValue).match(value);
        }else{
          if(this._equalWithActual(actualValue, value)){
          }else{
            matched = false;
          }
        }
      });
      if(matched === false){
        this.throw(`match ${JSON.stringify(object, null, 2)}`);
      }else{
        return this;
      }
    }else {
      this.throw(`match ${object}`);
    }
  }

  lengthOf(length){
    if(this.actual.length === length){
      return this;
    }else{
      this.throw(`length of ${length}`);
    }
  }

  a(target){
    if(this._equal(target)){
      return this;
    }else {
      this.throw(`a ${target}`)
    }
  }

  least(number){
    if(this.actual >= number){
      return this;
    }else {
      this.throw(`least ${number}`)
    }
  }

  most(number){
    if(this.actual <= number){
      return this;
    }else {
      this.throw(`most ${number}`)
    }
  }

  above(number){
    if(this.flags.includes("lengthOf")){
      if(this.actual.length > number){
        return this;
      }else {
        this.throw(`above ${number}`)
      }
    }else{
      if(this.actual > number){
        return this;
      }else {
        this.throw(`above ${number}`)
      }
    }
  }

  below(number){
    if(this.actual < number){
      return this;
    }else {
      this.throw(`below ${number}`)
    }
  }

  within(left, right){
    if(this.actual <= right && this.actual >= left){
      return this;
    }else{
      this.throw(`within [${left},${right}]`);
    }
  }

  equal(other){
    if(this._equal(other)){
      return this;
    }else{
      this.throw(`equal ${other}`);
    }
  }

  oneOf(array){
    if(array.includes(this.actual)){
      return this;
    }else{
      this.throw(`one of ${JSON.stringify(array)}`);
    }
  }

}




function expect(actual){
  const expectation = new Expectation(actual);
  return expectation;
}

expect.any = function(type){
  return new Any(type);
}

expect.anything = function(){
  return new Anything();
}

expect.stringMatching = function(regex){
  return new StringMatching(regex);
}

export default expect;
