import {YangSignatureMovesA, YangSignatureLearnsetsA, YangSignatureDescriptionsA} from './yang-signature-moves-a';
import {YangSignatureMovesB, YangSignatureLearnsetsB, YangSignatureDescriptionsB} from './yang-signature-moves-b';
export const YangSignatureMoves = {...YangSignatureMovesA, ...YangSignatureMovesB};
export const YangSignatureLearnsets = {...YangSignatureLearnsetsA, ...YangSignatureLearnsetsB};
export const YangSignatureDescriptions = {...YangSignatureDescriptionsA, ...YangSignatureDescriptionsB};

import {installYangFieldBonuses} from './yang-field-bonuses';
installYangFieldBonuses(YangSignatureMoves);

import {describeYangBonuses} from './yang-bonus-descriptions';
describeYangBonuses(YangSignatureDescriptions);
