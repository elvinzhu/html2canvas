import {CSSValue, parseFunctionArgs} from '../../syntax/parser';
import {TokenType} from '../../syntax/tokenizer';
import {isAngle, angle as angleType, parseNamedSide, deg} from '../angle';
import {CSSImageType, CSSLinearGradientImage, GradientCorner, UnprocessedGradientColorStop} from '../image';
import {calculateGradientDirection, parseColorStop, processColorStops} from './gradient';
import {Context} from '../../../core/context';
import {asString} from '../color';

export const linearGradient = (context: Context, tokens: CSSValue[]): CSSLinearGradientImage => {
    let angle: number | GradientCorner = deg(180);
    const stops: UnprocessedGradientColorStop[] = [];

    parseFunctionArgs(tokens).forEach((arg, i) => {
        if (i === 0) {
            const firstToken = arg[0];
            if (firstToken.type === TokenType.IDENT_TOKEN && firstToken.value === 'to') {
                angle = parseNamedSide(arg);
                return;
            } else if (isAngle(firstToken)) {
                angle = angleType.parse(context, firstToken);
                return;
            }
        }
        const colorStop = parseColorStop(context, arg);
        stops.push(colorStop);
    });

    return {angle, stops, type: CSSImageType.LINEAR_GRADIENT};
};

export const getLinearGradientFillStyle = (backgroundImage: CSSLinearGradientImage, width: number, height: number) => {
    const [lineLength, x0, x1, y0, y1] = calculateGradientDirection(backgroundImage.angle, width, height);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

    processColorStops(backgroundImage.stops, lineLength).forEach((colorStop) =>
        gradient.addColorStop(colorStop.stop, asString(colorStop.color))
    );

    return gradient;
};
