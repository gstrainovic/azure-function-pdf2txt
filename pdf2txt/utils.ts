/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

export const RegExpFromString = (strU: string | undefined) => {
    const str = strU ?? ""
    const res = str.match(/\/(.+)\//) ?? []
    const regexp = res[1]
    const resOp = str.match(/[a-z]+$/)?.shift() ?? ""
    return new RegExp(regexp, resOp)
}

export const IsEmptyRegExp = (regExp: RegExp) => {
    return regExp.source === RegExp(/(?:)/).source
}

export const matchs = (str: string, regExp: RegExp) => {
    const result = str.match(regExp)
    if (result) {
        if (result.length > 0) {
            const far = result.filter((x) => x !== undefined)
            if (far[1]) {
                return far[1]
            } else {
                return far[0]
            }
        } else { return undefined }
    } else { return undefined } 
}


// group by text, vatKey and dimension1 example
// const grouped: groupedType = group(
//     invoiceDescriptorPositionsUngrouped,
//     by((x) => x.account),
//     and((x) => x.text),
//     and((x) => x.vatKey),
//     and((x) => x.dimension1),
// )


export function* fgmatchAll(str: string, regexp: RegExp) {
    const flags = regexp.global ? regexp.flags : regexp.flags + "g"
    const re = new RegExp(regexp, flags)
    let match
    while ((match = re.exec(str))) {
        yield match
    }
}

export const group = (items: any, ...functions: ((items: any) => any)[]) =>
    functions.reduce((x, f) => f(x), items)

export const by = (selector: (arg0: any) => any) => (items: any[]) =>
    items.reduce((result, item) => {
        const key = selector(item)
        if (result[key] === undefined) {
            result[key] = []
        }
        result[key].push(item)
        return result
    }, {})

export const and =
    (selector: (arg0: any) => any) =>
        (grouping: { [s: string]: unknown } | ArrayLike<unknown>) => {
            const initialGrouping = Array.isArray(grouping)
                ? grouping
                : Object.entries(grouping).map(([key, values]) => ({
                    keys: [key],
                    values,
                }))
            return initialGrouping
                .map((pair) =>
                    Object.entries(group(pair.values, by(selector))).map(
                        ([key, values]) => ({
                            keys: [...pair.keys, key],
                            values,
                        }),
                    ),
                )
                .reduce((all, batch) => all.concat(batch), [])
        }

export const is_numeric = (str: string) => {
    return /^\d+$/.test(str)
}

export const matchAll = (str: string, regexp: RegExp): RegExpExecArray[] => {
    return Array.from(fgmatchAll(str, regexp))
}

export const parseGermanNumber = (s: string | undefined): number  => {
    if (!s) return 0
    s = s.replace(/\./g, "").replace(",", ".")
    return Number.parseFloat(s)
}

export const parseGermanDate = (s: string): Date | undefined => {
    if (!s) return undefined
    const comps = s.split(".")
    const date = new Date()
    const day = parseInt(comps[0])
    date.setUTCDate(day)
    date.setMonth(parseInt(comps[1]) - 1)
    let year = comps[2]
    if (year.length == 2) {
        year = "20" + year
    }
    date.setFullYear(parseInt(year))
    date.setSeconds(0)
    date.setMilliseconds(0)
    date.setMinutes(0)
    date.setHours(0)
    return date
}

