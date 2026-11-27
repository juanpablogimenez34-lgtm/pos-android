// Vista previa sin audio (control de calidad por hojas de contacto).
import React from 'react';
import {FosaDocumentary} from '../Documentary';

export const FosaPreview: React.FC = () => <FosaDocumentary quality="draft" showSubtitles audio={{}} extraTracks={false} />;
