export const sanitizeSequelizeModel = (model: any): any => {
    const obj = typeof model.get === 'function'
      ? model.get({ plain: true })
      : model;
  
    // Verwijder alleen Sequelize metadata
    delete obj._previousDataValues;
    delete obj._changed;
    delete obj._options;
    delete obj._model;
    delete obj._attributes;
    delete obj._creationAttributes;
    delete obj.category_id;
  
    // Recursief opschonen van geneste objecten
    for (const key in obj) {
      if (Array.isArray(obj[key])) {
        obj[key] = obj[key].map((item: any) => sanitizeSequelizeModel(item));
      } else if (obj[key] && typeof obj[key] === 'object') {
        obj[key] = sanitizeSequelizeModel(obj[key]);
      }
    }
  
    return obj;
  };