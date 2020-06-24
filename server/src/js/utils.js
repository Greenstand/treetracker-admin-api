function convertCamel(obj){
  const result = {};
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    const newKey = key.split("_").map((w,i) => {
      if(i === 0){
        return w;
      }else{
        return w.split('').map((c,i) => i === 0?c.toUpperCase():c).join('');
      }
    }).join('');
    result[newKey] = value;
  });
  return result;
}

function convertDB(obj){
  const result = {};
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    const newKey = key.split("").map(c => {
      if(c.match(/[QWERTYUIOPASDFGHJKLZXCVBNM]/)){
        return "_" + c.toLowerCase();
      }else{
        return c;
      }
    }).join('');
    result[newKey] = value;
  });
  return result;
}

function buildUpdateFields(obj){
  let fields = [];
  let where = "";
  obj = convertDB(obj);
  Object.keys(obj).forEach(key => {
    if(key === "id"){
      //where = `where id = ${obj[key]}`;
      //nothing
    }else if(key === "role"){
      //nothing
    }else{
      fields.push(` ${key} = '${obj[key]}' `);
    }
  });
  return fields.join(' , ') + where;
}

function buildInsertFields(obj){
  let fields = [];
  let values = [];
  obj = convertDB(obj);
  Object.keys(obj).forEach(key => {
    if(key === "id"){
      //where = `where id = ${obj[key]}`;
      //nothing
    }else if(key === "role"){
      //nothing
    }else{
      fields.push(`${key}`);
      values.push(`'${obj[key]}'`);
    }
  });
  return `(${fields.join(',')}) values (${values.join(',')})`;
}

function getEnvironment(){
  return process.env.NODE_ENV || 'development';
}

exports.utils = {
  convertCamel,
  convertDB,
  buildUpdateFields,
  buildInsertFields,
  getEnvironment
}
