import healthcareAgent from './authentication';
import { injectTransferTools } from '../utils';


const agents = injectTransferTools([healthcareAgent]);

export default agents;
