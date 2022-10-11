const parseModel = (data) => {
    let lines = data.split('\n');
    let vs = lines
        .filter(line => line.includes('v '))
        .map(e => e.substring(2))
        .map(e => e.split(' '))
        .map(e => e.map(a => parseFloat(a)));

    let vts = lines
        .filter(line => line.includes('vt  '))
        .map(e => e.substring(4))
        .map(e => e.split(' '))
        .map(e => e.map(a => parseFloat(a)));

    let vns = lines
        .filter(line => line.includes('vn  '))
        .map(e => e.substring(4))
        .map(e => e.split(' '))
        .map(e => e.map(a => parseFloat(a)));

    let faces = lines
        .filter(line => line.includes('f '))
        .map(e => e.substring(2))
        .map(e => e.split(' '))
        .map(e => e.map(a => a.split('/').map(a => parseInt(a))))

    return {
        v: vs,
        vn: vns,
        vt: vts,
        f: faces
    }
}

module.exports = parseModel