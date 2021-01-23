
'use strict';

const apiAddr = 'http://localhost:777';

function api (method, endpoint, obj) {
  return fetch(apiAddr + endpoint, {
    method: method,
    body: JSON.stringify(obj),
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json());
}

function createRow (id, guide) {
  const row = $('<tr/>');

  const cols = [id.toString(), guide.name, guide.group, guide.phone];
  for (const i of cols) row.append($('<td/>', { text: i }));

  const fields = row.children('td').slice(1, 4);
  const editButton = $('<button/>', {
    text: 'меняем',
    click: function () { edit($(this), id, fields); }
  });
  const deleteButton = $('<button/>', {
    class: 'w-50 btn btn-danger fa fa-trash',
    click: () => del(id, row)
  });

  const buttonGroup = $('<div/>', { class: 'w-100 btn-group' })
    .append(editButton, deleteButton);

  row.append($('<td/>').append(buttonGroup));

  return row;
}

function valid (obj) {
  return !!(obj.name || obj.group || obj.phone);
}

function add () { // eslint-disable-line no-unused-vars
  const inputs = $('#new_name, #new_group, #new_phone');
  const obj = {
    name: inputs[0].value,
    group: inputs[1].value,
    phone: inputs[2].value
  };
  if (valid(obj)) {
    api('POST', '/guide', obj).then(id => {
      $('#gues').append(createRow(id, obj));
      inputs.val('');
    });
  }
}

function del (id, row) {
  api('DELETE', '/guide/' + id).then(() => row.remove());
}

function toggleButton (btn) {
  return btn.off('click').toggleClass('fa-edit, fa-save');
}

function edit (btn, id, fields) {
  toggleButton(btn);
  for (const i of fields) {
    const value = $(i).text();
    $(i).html('')
      .append($('<input/>', { type: 'text', class: 'form-control', value: value }));
  }
  btn.click(() => save(btn, id, fields));
}

function save (btn, id, fields) {
  const values = fields.map(function () { return this.firstElementChild.value; });
  const obj = {
    name: values[0],
    group: values[1],
    phone: values[2]
  };
  if (valid(obj)) {
    api('PUT', '/guide/' + id, obj).then(() => {
      for (let i = 0; i < values.length; i++) {
        $(fields[i]).text(values[i]);
      }
      toggleButton(btn).click(() => edit(btn, id, fields));
    });
  }
}

function init (arr) {
  const tbody = $('#gues');
  arr.forEach((obj, id) => {
    if (obj) tbody.append(createRow(id, obj));
  });
}

$(() => api('GET', '/guide').then(init));