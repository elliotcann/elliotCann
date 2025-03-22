
$(document).ready(function () {

  // Call functions to populate tables
  getAllPersonnel();
  getAllDepartments();
  getAllLocations();
  
  // Clear search input
  $("#searchInp").val("");

  /*----------------------------------------*/
  /* Global variables */
  /*----------------------------------------*/

  // Clear Table  
  const clearTable = (tableType) => {
    if (tableType === "personnel") {
      $("#personnelTableBody").html(""); 
    }
    if (tableType === "departments") {
      $("#departmentTableBody").html("");
    }
    if (tableType === "locations") {
      $("#locationTableBody").html("");
    }
  };

  // <td> classes
  const tdClass = "align-middle text-nowrap d-none d-md-table-cell";
  const btnClass = "btn btn-primary btn-sm me-2 align-right";

  // <button> classes
  function createButton(id, buttonType, tableType = "Personnel") {
    
    const iconClass = buttonType === "edit" ? "fa-pencil" : "fa-trash";
    
    const modalTarget = `#${buttonType}${tableType}Modal`;
    
    return $("<button>", {
      type: "button",
      class: btnClass,
      "data-bs-toggle": "modal",
      "data-bs-target": modalTarget,
      "data-id": id
    }).append($("<i>", { class: `fa-solid ${iconClass} fa-fw` }));

  }

  /*----------------------------------------*/
  /* GET ALL DATA */
  /*----------------------------------------*/
  function getAllPersonnel () {
    
    $.ajax({
      url: "libs/php/getAllPersonnel.php",
      type: "GET",
      dataType: "json",
      success: function (result) {

        if (result.status.code == 200) {
          
          clearTable("personnel");
          
          $.each(result.data, function () {
            
            $("#personnelTableBody").append(
              
              $("<tr>").append(
                
                $("<td>", { text: `${this.lastName}, ${this.firstName}`, class: "align-middle text-nowrap" }),

                $("<td>", { text: this.jobTitle, class: tdClass }),

                $("<td>", { text: this.department, class: tdClass }),

                $("<td>", { text: this.location, class: tdClass }),

                $("<td>", { text: this.email, class: tdClass }),

                $("<td>", { class: "text-end pe-0"}).append(createButton(this.id, "edit", "Personnel")).append(createButton(this.id, "delete", "Personnel"))
              )
            );
          });

        }
      },

      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      }

    });

  };

  function getAllDepartments () {
    
    $.ajax({
      url: "libs/php/getAllDepartments.php",
      type: "GET",
      dataType: "json",
      success: function (result) {

        if (result.status.code == 200) {
          
          clearTable("departments");
          
          $.each(result.data, function () {

            $("#departmentTableBody").append(

              $("<tr>").append(
                
                $("<td>", { text: this.name, class: "align-middle text-nowrap" }),

                $("<td>", { text: this.location, class: tdClass }),

                $("<td>" , { class: "text-end pe-0"}).append(createButton(this.id, "edit", "Departments")).append(createButton(this.id, "delete", "Departments"))
              )
            );
          });

        }
      },

      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      }

    });

  };

  function getAllLocations () {
    
    $.ajax({
      url: "libs/php/getAllLocations.php",
      type: "GET",
      dataType: "json",
      success: function (result) {

        if (result.status.code == 200) {
          
          clearTable("locations");
          
          $.each(result.data, function () {

            $("#locationTableBody").append(

              $("<tr>").append(
                
                $("<td>", { text: this.name, class: "align-middle text-nowrap" }),

                $("<td>", { class: "text-end pe-0"}).append(createButton(this.id, "edit", "Locations")).append(createButton(this.id, "delete", "Locations"))
              )
            );
          });

        }
      },

      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      }

    });

  };


  /*----------------------------------------*/
  /* SEARCH FUNTCION */
  /*----------------------------------------*/

  $("#searchInp").on("keyup", function () {

    const searchInput = $(this).val();
    
    // Personel table
    if ($("#personnelBtn").hasClass("active")) {;
      
      $.ajax({
        url: "libs/php/searchAllPersonnel.php",
        type: "POST",
        dataType: "json",
        data: {
          txt: searchInput
        },

        success: function (result) {
          
          if (result.status.code == 200) {

            clearTable("personnel");
            
            if(result.data.found && result.data.found.length > 0) {
              $.each(result.data. found, function () {
                
                $("#personnelTableBody").append(
                  
                  $("<tr>").append(
                    
                    $("<td>", { text: `${this.lastName}, ${this.firstName}`, class: "align-middle text-nowrap" }),

                    $("<td>", { text: this.jobTitle, class: tdClass }),

                    $("<td>", { text: this.departmentName, class: tdClass }),

                    $("<td>", { text: this.locationName, class: tdClass }),

                    $("<td>", { text: this.email, class: tdClass }),

                    $("<td>", { class: "text-end pe-0"}).append(createButton(this.id, "edit", "Personnel")).append(createButton(this.id, "delete", "Personnel"))
                  )
                );
              });

            } else {
              
              $("#personnelTableBody").html(
                $("<tr>").append(
                  $("<td>", { colspan: 6, text: "No data found", class: "text-center" })
                )
              );

            }
          }
        },

        error: function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR);
          console.log(textStatus);
          console.log(errorThrown);
        }
      });
    
    // Department table
    } else if ($("#departmentsBtn").hasClass("active")) {
      
      $.ajax({
        url: "libs/php/searchAllDepartments.php",
        type: "POST",
        dataType: "json",
        data: {
          search: searchInput
        },
        success: function (result) {
          
          if (result.status.code == 200) {

            clearTable("departments");
            
            $.each(result.data, function () {

              $("#departmentTableBody").append(

                $("<tr>").append(
                  
                  $("<td>", { text: this.name, class: "align-middle text-nowrap" }),

                  $("<td>", { text: this.location, class: tdClass }),

                  $("<td>", { class: "text-end pe-0"}).append(createButton(this.id, "edit", "Departments")).append(createButton(this.id, "delete", "Departments"))
                )
              );
            });

          } else {

            $("#departmentTableBody").html(
              $("<tr>").append(
                $("<td>", { colspan: 3, text: "No data found" })
              )
            );

          }
        },

        error: function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR);
          console.log(textStatus);
          console.log(errorThrown);
        }

      });
    
    // Location table
    } else {
      
      $.ajax({
        url: "libs/php/searchAllLocations.php",
        type: "POST",
        dataType: "json",
        data: {
          search: searchInput
        },
        success: function (result) {
          
          if (result.status.code == 200) {

            clearTable("locations");
            
            $.each(result.data, function () {

              $("#locationTableBody").append(

                $("<tr>").append(
                  
                  $("<td>", { text: this.name, class: "align-middle text-nowrap" }),

                  $("<td>", { text: this.address, class: tdClass }),

                  $("<td>", { class: "text-end pe-0"}).append(createButton(this.id, "edit", "Locations")).append(createButton(this.id, "delete", "Locations"))
                )
              );
            });

          } else {

            $("#locationTableBody").html(
              $("<tr>").append(
                $("<td>", { colspan: 3, text: "No data found" })
              )
            );

          }
        },

        error: function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR);
          console.log(textStatus);
          console.log(errorThrown);
        }

      })

    }
    
  });


  /*----------------------------------------*/
  /* BUTTON FUNCTIONS */
  /*----------------------------------------*/

  $("#refreshBtn").click(function () {
      
    const ClearSearchInput = $("#searchInp").val("");

    if ($("#personnelBtn").hasClass("active")) {
      // Refresh personnel table
      getAllPersonnel();
      ClearSearchInput;

    } else if ($("#departmentsBtn").hasClass("active")) {
      // Refresh department table
      getAllDepartments();
      ClearSearchInput;

    } else {
      // Refresh location table
      getAllLocations();
      ClearSearchInput;

    }

  });

  $("#filterBtn").click(function () {
    
    // Open a modal of your own design that allows the user to apply a filter to the personnel table on either department or location
    
  });

  $("#addBtn").click(function () {
    
    // Replicate the logic of the refresh button click to open the add modal for the table that is currently on display
    
  });

  $("#personnelBtn").click(function () {
    // Call function to refresh personnel table
    getAllPersonnel();
    $("#searchInp").val("");
  });
  
  $("#departmentsBtn").click(function () {
    // Call function to refresh department table
    getAllDepartments();
    $("#searchInp").val("");
  });
  
  $("#locationsBtn").click(function () {
    // Call function to refresh location table
    getAllLocations();
    $("#searchInp").val("");
  });

  $("#editPersonnelModal").on("show.bs.modal", function (e) {
    
    $.ajax({
      url:
        "libs/php/getPersonnelByID.php",
      type: "POST",
      dataType: "json",
      data: {
        // Retrieve the data-id attribute from the calling button
        // see https://getbootstrap.com/docs/5.0/components/modal/#varying-modal-content
        // for the non-jQuery JavaScript alternative
        id: $(e.relatedTarget).attr("data-id") 
      },
      success: function (result) {
        var resultCode = result.status.code;

        if (resultCode == 200) {
          
          // Update the hidden input with the employee id so that
          // it can be referenced when the form is submitted

          $("#editPersonnelEmployeeID").val(result.data.personnel[0].id);

          $("#editPersonnelFirstName").val(result.data.personnel[0].firstName);
          $("#editPersonnelLastName").val(result.data.personnel[0].lastName);
          $("#editPersonnelJobTitle").val(result.data.personnel[0].jobTitle);
          $("#editPersonnelEmailAddress").val(result.data.personnel[0].email);

          $("#editPersonnelDepartment").html("");

          $.each(result.data.department, function () {
            $("#editPersonnelDepartment").append(
              $("<option>", {
                value: this.id,
                text: this.name
              })
            );
          });

          $("#editPersonnelDepartment").val(result.data.personnel[0].departmentID);
          
        } else {
          $("#editPersonnelModal .modal-title").replaceWith(
            "Error retrieving data"
          );
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $("#editPersonnelModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    });
  });

  // Executes when the form button with type="submit" is clicked

  $("#editPersonnelForm").on("submit", function (e) {
    
    // Executes when the form button with type="submit" is clicked
    // stop the default browser behviour

    e.preventDefault();

    // AJAX call to save form data
    
  });

});