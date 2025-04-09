export const sanitizeSequelizeModel = (model: any): any => {
    const obj = typeof model.get === 'function'
      ? model.get({ plain: true })
      : model;
  
    for (const key in obj) {
      if (key.includes('_')) {
        delete obj[key];
      }
  
      // Dieper opschonen (recursief)
      if (Array.isArray(obj[key])) {
        obj[key] = obj[key].map((item: any) => sanitizeSequelizeModel(item));
      } else if (obj[key] && typeof obj[key] === 'object') {
        obj[key] = sanitizeSequelizeModel(obj[key]);
      }
    }
  
    return obj;
  };