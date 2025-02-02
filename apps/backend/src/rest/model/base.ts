import { Model, Sequelize } from "sequelize";
import Global from "@/global";
type ModelCtor = typeof Model & { new (): Model<any, any> };
interface ModelProps {
  connection: string;
  model: string;
  attributes: any;
  options: any;
  // associate?: (models: any) => void;
}
export type BaseModel = ModelCtor & {
  connection: string;
  // hasAssociate?: boolean;
};
export default (props: ModelProps): BaseModel => {
  if (!(props.connection in Global().DBCon)) {
    throw `Error: Connection named '${props.connection}' is not exists in connections pool`;
  }
  var con: Sequelize = Global().DBCon[props.connection];

  //console.log(props.model);
  const mod = con.define(props.model, props.attributes, props.options);

  (mod as BaseModel).connection = props.connection;
  // if (props.associate && !(mod as BaseModel).hasAssociate) {
  //   console.log("associate done!");
  //   props.associate(mod);
  //   (mod as BaseModel).hasAssociate = true;
  // }
  return mod as BaseModel;
};
