// export that make it convenient to hijacking prototype function
import SolidityFunction = require("chain3/lib/chain3/function");

import ERC20 from "./erc20";
import ERC721 from "./erc721";
import Fingate from "./fingate";
import Moac from "./moac";
import smartContract from "./smartContract";

export { Fingate, Moac, smartContract, ERC20, ERC721, SolidityFunction };
