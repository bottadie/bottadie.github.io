function CopyNames(executionContext) {
    var formContext = executionContext.getFormContext();
    var contactName = formContext.getAttribute('new_attendeecontact').getValue()[0].name;
    var EventName = formContext.getAttribute('new_mededeventname').getValue()[0].name;
    formContext.getAttribute('new_mededattendeenamelabel').setValue(EventName + ' - ' + contactName);
  }
  
  function getRecordDetail(recordID) {
    var parms = recordID[0].replace(/[{}]/g, '');
    var url =
      'https://prod-29.brazilsouth.logic.azure.com:443/workflows/97bd22e3702b4ee5ba514d03c38884e9/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=mOE49hWbxbi_QPILumUkU16ADSYO4FmFYUTJ2bmPsYc';
    var confirmStrings = { text: 'Confirm create the event?.', title: 'EventBrite Management' };
    var confirmOptions = { height: 200, width: 450 };
  
    Xrm.WebApi.retrieveRecord(
      'new_mededevent',
      parms,
      '?$select=new_eventplace,new_eventaddress,new_eventcity,new_eventname,new_eventaddressprovince,new_eventenddate,new_eventstartdate,cr920_eventcountrypl,new_eventcountrypl'
    )
      .then(function success(result) {
        const isEmpty = Object.values(result).some((x) => x === null || x === '' || x === undefined);
        console.log(result)
        if (isEmpty) {
          const Fields = {
            new_eventplace: 'Event Place',
            new_eventaddress: 'Event Address',
            new_eventcity: 'Event City',
            new_eventcountrypl: 'Event Country (Place)',
            new_eventname: 'Event Name',
            new_eventaddressprovince: 'Event Province',
            new_eventenddate: 'Event End Date',
            new_eventstartdate: 'Event Start Date',
            cr920_eventcountrypl: 'Event Country (Organizing)'
                  };
          const emptyFields = Object.entries(result)
            .filter(([key, value]) => value === null || value === '' || value === undefined)
            .map(([key, value]) => Fields[key]);
          Xrm.Utility.alertDialog(`The following fields are empty: ${emptyFields.join(', ')}`);
        } else if (result.new_eventstartdate > result.new_eventenddate) {
          Xrm.Utility.alertDialog('The event start date cannot be greater than the event end date.');
        } else {
          Xrm.Navigation.openConfirmDialog(confirmStrings, confirmOptions).then(function (success) {
            if (success.confirmed) {
              var req = new XMLHttpRequest();
              req.open('POST', url, true);
              req.setRequestHeader('Content-Type', 'application/json');
              req.send(JSON.stringify(parms));
              Xrm.Utility.alertDialog('Flow initiated. The event will be create soon.');
            } else {
              console.log('Dialog closed using Cancel button or X.');
            }
          }).catch(function (error) {console.log(error);});
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }