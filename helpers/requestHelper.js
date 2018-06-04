exports.checkBlank = function(arr) {

    var arrlength = arr.length;

    for (var i = 0; i < arrlength; i++) {
        if (arr[i] === undefined || arr[i] == null) {
            arr[i] = "";
        } else {
            arr[i] = arr[i];
        }
        arr[i] = arr[i].toString().trim();
        if (arr[i] === '' || arr[i] === "" || arr[i] === undefined) {
            return 1;
            break;
        }
    }
    return 0;
};