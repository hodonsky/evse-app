import { TComponent} from "../common/types"
import { EScreenType, EScreenResolution } from "./enums"

export interface IDisplay extends TComponent{
  screenType: EScreenType,
  screenSize: number,
  bits      : number,
  resolution: EScreenResolution
}