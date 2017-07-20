/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare module "*.json"
{ const value: any;
  export default value;
}

declare var RiTa: any;
declare var RiGrammar: any;
declare var RiMarkov: any;

// declare module "json!*"
// { const value: any;
//   export default value;
// }
